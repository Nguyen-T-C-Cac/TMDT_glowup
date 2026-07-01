package com.example.becommerce.service.impl;

import com.example.becommerce.constant.ErrorCode;
import com.example.becommerce.dto.mapper.ReviewMapper;
import com.example.becommerce.dto.mapper.TechnicianMapper;
import com.example.becommerce.dto.request.technician.UpdateAvailabilityRequest;
import com.example.becommerce.dto.request.technician.UpdateTechnicianProfileRequest;
import com.example.becommerce.dto.response.PagedResponse;
import com.example.becommerce.dto.response.review.ReviewResponse;
import com.example.becommerce.dto.response.technician.AvailabilityResponse;
import com.example.becommerce.dto.response.technician.TechnicianDashboardResponse;
import com.example.becommerce.dto.response.technician.CompletedProjectResponse;
import com.example.becommerce.dto.response.technician.TechnicianDetailResponse;
import com.example.becommerce.dto.response.technician.TechnicianListItemResponse;
import com.example.becommerce.dto.response.technician.TechnicianProfileUpdateResponse;
import com.example.becommerce.dto.response.technician.TechnicianReviewListResponse;
import com.example.becommerce.dto.response.technician.TechnicianScheduleResponse;
import com.example.becommerce.entity.Order;
import com.example.becommerce.entity.Review;
import com.example.becommerce.entity.TechnicianProfile;
import com.example.becommerce.entity.User;
import com.example.becommerce.entity.enums.OrderStatus;
import com.example.becommerce.entity.enums.Role;
import com.example.becommerce.exception.AppException;
import com.example.becommerce.repository.OrderRepository;
import com.example.becommerce.repository.ReviewRepository;
import com.example.becommerce.repository.TechnicianProfileRepository;
import com.example.becommerce.repository.UserRepository;
import com.example.becommerce.service.TechnicianService;
import com.example.becommerce.utils.TechnicianSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
 
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Technician business operations.
 *
 * <p>Profile creation strategy: each technician's profile row is lazily
 * created the first time it's needed, so legacy users that registered
 * before this module existed don't break.
 *
 * <p>Aggregate metrics — average rating, review count, completed jobs —
 * are computed on-demand against the Review and Order tables. For high
 * traffic these should be denormalized; for now correctness over speed.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TechnicianServiceImpl implements TechnicianService {

    private final TechnicianProfileRepository profileRepository;
    private final UserRepository              userRepository;
    private final ReviewRepository            reviewRepository;
    private final OrderRepository             orderRepository;
    private final TechnicianMapper            technicianMapper;
    private final ReviewMapper                reviewMapper;

    // ===============================================================
    // LIST
    // ===============================================================

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<TechnicianListItemResponse> listTechnicians(
            String service, String district, Boolean isAvailable, Double minRating,
            String keyword, int page, int limit) {

        Specification<TechnicianProfile> spec =
                TechnicianSpecification.buildFilter(service, district, isAvailable, keyword);

        Pageable pageable = PageRequest.of(
                Math.max(0, page - 1),
                limit,
                Sort.by(Sort.Direction.DESC, "joinedAt"));

        Page<TechnicianProfile> profiles = profileRepository.findAll(spec, pageable);

        List<TechnicianListItemResponse> items = profiles.getContent().stream()
                .map(this::buildListItem)
                .filter(item -> minRating == null
                        || (item.getRating() != null && item.getRating().doubleValue() >= minRating))
                .toList();

        return PagedResponse.of(items, page, limit, profiles.getTotalElements());
    }

    // ===============================================================
    // DETAIL
    // ===============================================================

    @Override
    @Transactional(readOnly = true)
    public TechnicianDetailResponse getTechnician(String code) {
        User technician = findTechnicianUser(code);
        TechnicianProfile profile = findOrCreateProfile(technician);

        Long techId = technician.getId();
        Double avg = reviewRepository.averageRatingByTechnician(techId);
        long reviews = reviewRepository.countByTechnician_Id(techId);
        long completed = orderRepository.countByTechnician_IdAndStatusAndDeletedFalse(
                techId, OrderStatus.COMPLETED);

        return technicianMapper.toDetail(profile, avg, reviews, completed);
    }

    // ===============================================================
    // UPDATE PROFILE
    // ===============================================================

    @Override
    @Transactional
    public TechnicianProfileUpdateResponse updateProfile(String code, UpdateTechnicianProfileRequest request) {
        User technician = findTechnicianUser(code);
        ensureSelfOrAdmin(technician);

        TechnicianProfile profile = findOrCreateProfile(technician);

        // ---- Apply user-side fields (only if provided) -------------
        if (StringUtils.hasText(request.getFullName()))         technician.setFullName(request.getFullName());
        if (StringUtils.hasText(request.getPhone()))            technician.setPhone(request.getPhone());
        if (StringUtils.hasText(request.getEmail()))            technician.setEmail(request.getEmail().toLowerCase());
        if (StringUtils.hasText(request.getAvatar()))           technician.setAvatar(request.getAvatar());
        if (StringUtils.hasText(request.getDistrict()))         technician.setDistrict(request.getDistrict());
        if (StringUtils.hasText(request.getBio()))              technician.setBio(request.getBio());
        userRepository.save(technician);

        // ---- Apply profile-side fields -----------------------------
        if (StringUtils.hasText(request.getCoverImage()))       profile.setCoverImage(request.getCoverImage());
        if (StringUtils.hasText(request.getServiceCategory()))  profile.setServiceCategory(request.getServiceCategory());
        if (request.getPricePerHour() != null)                  profile.setPricePerHour(request.getPricePerHour());
        if (request.getYearsExperience() != null)               profile.setYearsExperience(request.getYearsExperience());

        if (request.getSkills() != null) {
            profile.getSkills().clear();
            request.getSkills().stream()
                    .filter(StringUtils::hasText)
                    .map(String::trim)
                    .forEach(profile.getSkills()::add);
        }
        if (request.getAreas() != null) {
            profile.getAreas().clear();
            request.getAreas().stream()
                    .filter(StringUtils::hasText)
                    .map(String::trim)
                    .forEach(profile.getAreas()::add);
        }
        if (request.getSchedule() != null) {
            // Replace whole schedule with provided one (null values clear that day).
            Map<String, String> newSchedule = new HashMap<>();
            request.getSchedule().forEach((day, time) -> {
                if (StringUtils.hasText(day) && StringUtils.hasText(time)) {
                    newSchedule.put(day.toLowerCase().trim(), time.trim());
                }
            });
            profile.getSchedule().clear();
            profile.getSchedule().putAll(newSchedule);
        }

        TechnicianProfile saved = profileRepository.save(profile);
        log.info("Technician profile updated for {}", technician.getCode());
        return technicianMapper.toUpdateResponse(saved);
    }

    // ===============================================================
    // AVAILABILITY
    // ===============================================================

    @Override
    @Transactional
    public AvailabilityResponse updateAvailability(String code, UpdateAvailabilityRequest request) {
        User technician = findTechnicianUser(code);
        ensureSelfOrAdmin(technician);
        TechnicianProfile profile = findOrCreateProfile(technician);

        profile.setAvailable(Boolean.TRUE.equals(request.getIsAvailable()));
        TechnicianProfile saved = profileRepository.save(profile);
        return technicianMapper.toAvailabilityResponse(saved);
    }

    // ===============================================================
    // REVIEWS
    // ===============================================================

    @Override
    @Transactional(readOnly = true)
    public TechnicianReviewListResponse listReviews(String code, int page, int limit) {
        User technician = findTechnicianUser(code);
        Long techId = technician.getId();

        Pageable pageable = PageRequest.of(
                Math.max(0, page - 1),
                limit,
                Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Review> reviews = reviewRepository.findByTechnician_IdOrderByCreatedAtDesc(techId, pageable);

        List<ReviewResponse> items = reviews.getContent().stream()
                .map(reviewMapper::toResponse)
                .toList();

        Double avg = reviewRepository.averageRatingByTechnician(techId);
        long total = reviewRepository.countByTechnician_Id(techId);

        return TechnicianReviewListResponse.builder()
                .averageRating(avg == null || avg == 0d
                        ? null
                        : BigDecimal.valueOf(avg).setScale(1, RoundingMode.HALF_UP))
                .totalReviews(total)
                .items(items)
                .pagination(PagedResponse.PaginationMeta.builder()
                        .page(page)
                        .limit(limit)
                        .total(reviews.getTotalElements())
                        .totalPages((int) Math.ceil((double) reviews.getTotalElements() / limit))
                        .build())
                .build();
    }
    // ===============================================================
    // COMPLETED PROJECTS
    // ===============================================================
 
    @Override
    @Transactional(readOnly = true)
    public List<CompletedProjectResponse> listCompletedProjects(String code) {
        User technician = findTechnicianUser(code);
 
        List<Order> orders = orderRepository.findCompletedByTechnicianId(
                technician.getId(), OrderStatus.COMPLETED);
 
        return orders.stream()
                .map(order -> CompletedProjectResponse.builder()
                        .id(order.getId())
                        .code(order.getCode())
                        .serviceCategory(order.getServiceCategory())
                        .serviceName(order.getServiceName())
                        .description(order.getDescription())
                        .deviceName(order.getDeviceName())
                        .build())
                .toList();
    }
    // ===============================================================
    // SCHEDULE
    // ===============================================================

    @Override
    @Transactional(readOnly = true)
    public TechnicianScheduleResponse getTechnicianSchedule(String code, LocalDate from, LocalDate to) {
        User technician = findTechnicianUser(code);
        TechnicianProfile profile = findOrCreateProfile(technician);

        LocalDateTime fromDt = from.atStartOfDay();
        LocalDateTime toDt = to.atTime(LocalTime.MAX);

        List<Order> orders = orderRepository
                .findByTechnician_IdAndScheduledAtBetweenAndDeletedFalse(
                        technician.getId(), fromDt, toDt);

        List<TechnicianScheduleResponse.BookedSlot> bookedSlots = orders.stream()
                .filter(o -> o.getScheduledAt() != null)
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                .map(o -> TechnicianScheduleResponse.BookedSlot.builder()
                        .date(o.getScheduledAt().toLocalDate())
                        .startTime(o.getScheduledAt().toLocalTime())
                        .endTime(o.getExpectedTime() != null
                                ? o.getExpectedTime().toLocalTime()
                                : o.getScheduledAt().toLocalTime().plusHours(2))
                        .orderCode(o.getCode())
                        .status(o.getStatus().apiValue())
                        .build())
                .toList();

        return TechnicianScheduleResponse.builder()
                .weeklySchedule(profile.getSchedule())
                .bookedSlots(bookedSlots)
                .build();
    }

    // ===============================================================
    // DASHBOARD (TN5)
    // ===============================================================

    private static final DateTimeFormatter DAY_LABEL = DateTimeFormatter.ofPattern("dd/MM");

    @Override
    @Transactional(readOnly = true)
    public TechnicianDashboardResponse getDashboard(String code) {
        User technician = findTechnicianUser(code);
        ensureSelfOrAdmin(technician);
        Long techId = technician.getId();

        LocalDate today = LocalDate.now();
        LocalDateTime startOfToday = today.atStartOfDay();
        LocalDateTime endOfToday = today.atTime(LocalTime.MAX);
        LocalDateTime startOfMonth = today.withDayOfMonth(1).atStartOfDay();

        long newOrders = orderRepository.countByTechnician_IdAndStatusInAndDeletedFalse(
                techId, List.of(OrderStatus.ASSIGNED, OrderStatus.SCHEDULED, OrderStatus.IN_PROGRESS));
        long completedOrders = orderRepository.countByTechnician_IdAndStatusAndDeletedFalse(
                techId, OrderStatus.COMPLETED);
        long completedToday = orderRepository.countByTechnician_IdAndStatusAndCompletedAtBetweenAndDeletedFalse(
                techId, OrderStatus.COMPLETED, startOfToday, endOfToday);
        long todayEarnings = orderRepository.sumTechnicianEarningsBetween(techId, startOfToday, endOfToday);
        long monthEarnings = orderRepository.sumTechnicianEarningsBetween(techId, startOfMonth, endOfToday);

        // Today's schedule (orders scheduled for today, earliest first).
        List<TechnicianDashboardResponse.ScheduleItem> schedule =
                orderRepository.findByTechnician_IdAndScheduledAtBetweenAndDeletedFalseOrderByScheduledAtAsc(
                                techId, startOfToday, endOfToday)
                        .stream()
                        .map(this::toScheduleItem)
                        .toList();

        // Earnings — last 7 days (daily).
        Map<String, Long> daily7 = toDailyMap(orderRepository.sumTechnicianEarningsGroupByDay(
                techId, today.minusDays(6).atStartOfDay(), endOfToday));
        List<TechnicianDashboardResponse.EarningPoint> earnings7d = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            earnings7d.add(TechnicianDashboardResponse.EarningPoint.builder()
                    .label(d.format(DAY_LABEL))
                    .amount(daily7.getOrDefault(d.toString(), 0L))
                    .build());
        }

        // Earnings — last 4 weeks (weekly buckets of 7 days).
        LocalDate fourWeeksAgo = today.minusDays(27);
        Map<String, Long> daily30 = toDailyMap(orderRepository.sumTechnicianEarningsGroupByDay(
                techId, fourWeeksAgo.atStartOfDay(), endOfToday));
        List<TechnicianDashboardResponse.EarningPoint> earnings30d = new ArrayList<>();
        for (int w = 0; w < 4; w++) {
            LocalDate bucketStart = fourWeeksAgo.plusDays(w * 7L);
            long sum = 0;
            for (int d = 0; d < 7; d++) {
                sum += daily30.getOrDefault(bucketStart.plusDays(d).toString(), 0L);
            }
            earnings30d.add(TechnicianDashboardResponse.EarningPoint.builder()
                    .label("Tuần " + (w + 1))
                    .amount(sum)
                    .build());
        }

        return TechnicianDashboardResponse.builder()
                .newOrders(newOrders)
                .completedOrders(completedOrders)
                .completedToday(completedToday)
                .todayEarnings(todayEarnings)
                .monthEarnings(monthEarnings)
                .todaySchedule(schedule)
                .earnings7d(earnings7d)
                .earnings30d(earnings30d)
                .build();
    }

    private TechnicianDashboardResponse.ScheduleItem toScheduleItem(Order order) {
        return TechnicianDashboardResponse.ScheduleItem.builder()
                .code(order.getCode())
                .serviceName(order.getServiceName())
                .deviceName(order.getDeviceName())
                .customerName(order.getCustomer() != null ? order.getCustomer().getFullName() : null)
                .address(order.getAddress())
                .scheduledAt(order.getScheduledAt())
                .expectedTime(order.getExpectedTime())
                .status(order.getStatus() != null ? order.getStatus().apiValue() : null)
                .build();
    }

    /** Turn the (yyyy-MM-dd, total) rows of a native group-by query into a date→amount map. */
    private Map<String, Long> toDailyMap(List<Object[]> rows) {
        Map<String, Long> map = new HashMap<>();
        for (Object[] row : rows) {
            if (row.length < 2 || row[0] == null) {
                continue;
            }
            long total = row[1] instanceof Number n ? n.longValue() : 0L;
            map.put(String.valueOf(row[0]), total);
        }
        return map;
    }

    // ===============================================================
    // Helpers
    // ===============================================================

    private TechnicianListItemResponse buildListItem(TechnicianProfile profile) {
        Long techId = profile.getUser().getId();
        Double avg = reviewRepository.averageRatingByTechnician(techId);
        long reviews = reviewRepository.countByTechnician_Id(techId);
        long completed = orderRepository.countByTechnician_IdAndStatusAndDeletedFalse(
                techId, OrderStatus.COMPLETED);
        return technicianMapper.toListItem(profile, avg, reviews, completed);
    }

    private User findTechnicianUser(String code) {
        User user = userRepository.findByCodeAndDeletedFalse(code)
                .orElseThrow(() -> AppException.notFound("Không tìm thấy thợ " + code));
        if (user.getRole() != Role.TECHNICIAN) {
            throw AppException.badRequest(ErrorCode.VALIDATION_ERROR,
                    "Tài khoản không phải tài khoản thợ");
        }
        return user;
    }

    private TechnicianProfile findOrCreateProfile(User technician) {
        return profileRepository.findByUser_Id(technician.getId())
                .orElseGet(() -> profileRepository.save(
                        TechnicianProfile.builder().user(technician).build()));
    }

    private void ensureSelfOrAdmin(User target) {
        User current = getCurrentUser();
        if (current.getRole() == Role.ADMIN) return;
        if (current.getId().equals(target.getId())) return;
        throw AppException.forbidden("Bạn không có quyền chỉnh sửa hồ sơ thợ khác");
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw AppException.unauthorized("Người dùng chưa đăng nhập");
        }
        String email = authentication.getName();
        return userRepository.findByEmailAndDeletedFalse(email)
                .orElseThrow(() -> AppException.notFound("Không tìm thấy người dùng hiện tại"));
    }
}
