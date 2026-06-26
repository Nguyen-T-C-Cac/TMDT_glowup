package com.example.becommerce.service.impl;

import com.example.becommerce.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import jakarta.annotation.PostConstruct;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

/**
 * Implementation of EmailService using Spring Mail.
 * Design system matches GlowUp frontend:
 *   Primary   #1a1e3b  (blueberry dark)
 *   Accent    #DEC38D  (gold)
 *   Secondary #2a315e  (blueberry light)
 *   Text sub  #94a3b8
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    @Value("${spring.mail.host:smtp.gmail.com}")
    private String mailHost;

    @Value("${spring.mail.port:587}")
    private int mailPort;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @PostConstruct
    public void logMailConfig() {
        boolean hasPassword = mailPassword != null && !mailPassword.isBlank();
        log.info("Mail config -> host: {} port: {} username: {} passwordPresent: {}", mailHost, mailPort, senderEmail, hasPassword);
    }

    @Value("${app.name:GlowUp}")
    private String appName;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    // ─────────────────────────────────────────────
    //  Public API
    // ─────────────────────────────────────────────

    @Override
    public void sendConfirmationEmail(String email, String fullName, String confirmationToken) {
        try {
            String url = frontendUrl + "/verify-email?token=" + confirmationToken;
            sendHtmlEmail(email,
                    "Xác nhận tài khoản " + appName,
                    buildConfirmationEmailHtml(fullName, url));
            log.info("Confirmation email sent to: {}", email);
        } catch (Exception e) {
            log.error("Failed to send confirmation email to {}: {}", email, e.getMessage(), e);
            throw new RuntimeException("Gửi email thất bại: " + e.getMessage(), e);
        }
    }

    @Override
    public void sendPasswordResetEmail(String email, String resetToken) {
        try {
            String url = frontendUrl + "/reset-password?token=" + resetToken;
            sendHtmlEmail(email,
                    "Đặt lại mật khẩu - " + appName,
                    buildPasswordResetEmailHtml(url));
            log.info("Password reset email sent to: {}", email);
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}: {}", email, e.getMessage(), e);
            throw new RuntimeException("Gửi email thất bại: " + e.getMessage(), e);
        }
    }

    @Override
    public void sendNotificationEmail(String email, String subject, String body) {
        try {
            sendHtmlEmail(email, subject, buildNotificationEmailHtml(subject, body));
            log.info("Notification email sent to: {}", email);
        } catch (Exception e) {
            log.error("Failed to send notification email to {}: {}", email, e.getMessage(), e);
        }
    }

    /**
     * Gửi email thông báo đơn hàng mới được nhận.
     * Gọi khi thợ accept đơn.
     */
    public void sendOrderAcceptedEmail(String email, String customerName,
                                       String orderId, String technicianName,
                                       String scheduledTime) {
        try {
            sendHtmlEmail(email,
                    "Đơn hàng #" + orderId + " đã được nhận - " + appName,
                    buildOrderAcceptedEmailHtml(customerName, orderId, technicianName, scheduledTime));
            log.info("Order accepted email sent to: {}", email);
        } catch (Exception e) {
            log.error("Failed to send order accepted email to {}: {}", email, e.getMessage(), e);
        }
    }

    /**
     * Gửi email thông báo đơn hàng hoàn thành.
     */
    public void sendOrderCompletedEmail(String email, String customerName,
                                        String orderId, long finalPrice) {
        try {
            sendHtmlEmail(email,
                    "Đơn hàng #" + orderId + " hoàn thành - " + appName,
                    buildOrderCompletedEmailHtml(customerName, orderId, finalPrice));
            log.info("Order completed email sent to: {}", email);
        } catch (Exception e) {
            log.error("Failed to send order completed email to {}: {}", email, e.getMessage(), e);
        }
    }

    /**
     * Gửi email xác nhận nạp tiền thành công.
     */
    public void sendTopUpSuccessEmail(String email, String fullName,
                                      long amount, String transactionId) {
        try {
            sendHtmlEmail(email,
                    "Nạp tiền thành công - " + appName,
                    buildTopUpSuccessEmailHtml(fullName, amount, transactionId));
            log.info("Top-up success email sent to: {}", email);
        } catch (Exception e) {
            log.error("Failed to send top-up email to {}: {}", email, e.getMessage(), e);
        }
    }

    // ─────────────────────────────────────────────
    //  Core sender
    // ─────────────────────────────────────────────

    private void sendHtmlEmail(String to, String subject, String htmlContent) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(senderEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);
        mailSender.send(message);
    }

    // ─────────────────────────────────────────────
    //  Shared layout helpers
    // ─────────────────────────────────────────────

    private String wrapLayout(String bodyContent) {
        return "<!DOCTYPE html>" +
                "<html lang='vi'>" +
                "<head>" +
                "  <meta charset='UTF-8'/>" +
                "  <meta name='viewport' content='width=device-width,initial-scale=1'/>" +
                "  <title>" + appName + "</title>" +
                "</head>" +
                "<body style='" +
                "  margin:0;padding:0;" +
                "  background-color:#F7F8FB;" + // --bg-page
                "  font-family:\'Inter\', \'Be Vietnam Pro\', \'Segoe UI\', Tahoma, Arial, sans-serif;" +
                "  -webkit-font-smoothing:antialiased;" +
                "'>" +

                // ── Outer wrapper
                "<table width='100%' cellpadding='0' cellspacing='0' border='0'" +
                "  style='background-color:#F7F8FB;padding:40px 16px'>" +
                "<tr><td align='center'>" +

                // ── Card chính
                "<table width='600' cellpadding='0' cellspacing='0' border='0'" +
                "  style='max-width:600px;width:100%;border-radius:20px;overflow:hidden;" +
                "         box-shadow:0 12px 24px rgba(36,51,83,0.06);background:#ffffff'>" + // --shadow-md & --white

                // ── Header (Đổi sang tone màu Primary Green hệ thống)
                "<tr><td style='" +
                "  background:linear-gradient(135deg,#68A877 0%,#45834D 100%);" + // --primary sang --primary-hover
                "  padding:36px 40px 28px;text-align:center'>" +

                // Logo mark
                "<div style='" +
                "  display:inline-block;" +
                "  background:rgba(255,255,255,0.15);" + // Hiệu ứng glassmorphism nhẹ trên nền xanh
                "  border:1px solid rgba(255,255,255,0.25);" +
                "  border-radius:12px;" +
                "  padding:10px 24px;" +
                "  margin-bottom:12px'>" +
                "<span style='font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.5px'>" +
                appName +
                "</span>" +
                "</div>" +

                "<br/>" +
                "<span style='font-size:12px;color:#caecce;letter-spacing:1.5px;text-transform:uppercase;font-weight:600'>" + // --text-light
                "Nền tảng dịch vụ nhà cửa cao cấp" +
                "</span>" +
                "</td></tr>" +

                // ── Body
                "<tr><td style='background:#ffffff;padding:40px;color:#243353;font-size:15px;line-height:1.6'>" + // --text-primary
                bodyContent +
                "</td></tr>" +

                // ── Footer
                "<tr><td style='" +
                "  background:#F7F8FB;" + // --bg-subtle
                "  border-top:1px solid #E2E8F0;" + // --border-default
                "  padding:24px 40px;" +
                "  text-align:center'>" +

                "<p style='margin:0 0 6px;font-size:13px;color:#717B8C'>" + // --text-muted
                "&copy; 2026 " + appName + ". All rights reserved." +
                "</p>" +
                "<p style='margin:0;font-size:12px;color:#717B8C'>" +
                "Email này được gửi tự động, vui lòng không trả lời." +
                "</p>" +
                "</td></tr>" +

                "</table>" + // end card
                "</td></tr>" +
                "</table>" + // end outer
                "</body></html>";
    }

    /** Nút CTA chính — Đổi sang màu Primary Green rực rỡ và dễ tương tác */
    private String ctaButton(String url, String label) {
        return "<table cellpadding='0' cellspacing='0' border='0' style='margin:28px auto'>" +
                "<tr><td align='center' style='" +
                "  background:#68A877;" + // --primary
                "  border-radius:12px;" + // --radius-md
                "  box-shadow:0 6px 16px rgba(104,168,119,0.25)'>" +
                "<a href='" + url + "' style='" +
                "  display:inline-block;" +
                "  padding:14px 36px;" +
                "  font-size:15px;" +
                "  font-weight:700;" +
                "  color:#ffffff;" + // Chữ trắng nổi bật trên nền xanh
                "  text-decoration:none;" +
                "  letter-spacing:0.2px'>" +
                label +
                "</a>" +
                "</td></tr>" +
                "</table>";
    }

    /** Badge trạng thái nhỏ */
    private String badge(String text, String bgColor, String textColor) {
        return "<span style='" +
                "  display:inline-block;" +
                "  background:" + bgColor + ";" +
                "  color:" + textColor + ";" +
                "  font-size:12px;" +
                "  font-weight:700;" +
                "  padding:4px 14px;" +
                "  border-radius:100px;" + // --radius-pill
                "  letter-spacing:0.5px;" +
                "  text-transform:uppercase'>" +
                text +
                "</span>";
    }

    /** Divider */
    private String divider() {
        return "<hr style='border:none;border-top:1px solid #E2E8F0;margin:28px 0'/>"; // --border-default
    }

    /** Info row dùng trong order detail */
    private String infoRow(String label, String value) {
        return "<tr>" +
                "<td style='padding:10px 0;font-size:14px;color:#717B8C;width:40%'>" + label + "</td>" + // --text-secondary
                "<td style='padding:10px 0;font-size:14px;color:#243353;font-weight:600'>" + value + "</td>" + // --text-primary
                "</tr>";
    }

    /** Fallback link */
    private String fallbackLink(String url) {
        return "<p style='margin:16px 0 0;font-size:12px;color:#717B8C;text-align:center'>" +
                "Nếu nút không hoạt động, sao chép link sau vào trình duyệt:<br/>" +
                "<a href='" + url + "' style='color:#68A877;word-break:break-all'>" + url + "</a>" + // --primary màu xanh liên kết thương hiệu
                "</p>";
    }

    // ─────────────────────────────────────────────
    //  Email templates
    // ─────────────────────────────────────────────

    /**
     * Template 1: Xác nhận email đăng ký
     */
    public String buildConfirmationEmailHtml(String fullName, String confirmationUrl) {
        String body =
                // Greeting
                "<h2 style='margin:0 0 12px;font-size:22px;font-weight:700;color:#243353;letter-spacing:-0.5px'>" +
                "Xác nhận tài khoản của bạn 👋" +
                "</h2>" +
                "<p style='margin:0 0 24px;font-size:15px;color:#717B8C;line-height:1.6'>" +
                "Xin chào <strong style='color:#243353'>" + fullName + "</strong>,<br/>" +
                "Cảm ơn bạn đã đăng ký tài khoản tại <strong>" + appName + "</strong>. " +
                "Vui lòng xác nhận địa chỉ email để kích hoạt tài khoản và bắt đầu trải nghiệm dịch vụ nhà cửa cao cấp của chúng tôi." +
                "</p>" +

                // Feature highlights (Đồng bộ box sang màu nhạt của GlowUp)
                "<table width='100%' cellpadding='0' cellspacing='0' border='0'" +
                "  style='background:#F7F8FB;border-radius:14px;padding:16px 20px;margin-bottom:24px'>" +
                "<tr>" +
                featureItem("✅", "Đặt lịch sửa chữa nhanh chóng") +
                "</tr><tr>" +
                featureItem("🔧", "Kỹ thuật viên được xác minh 100%") +
                "</tr><tr>" +
                featureItem("⭐", "Đánh giá minh bạch, đảm bảo chất lượng") +
                "</tr>" +
                "</table>" +

                // CTA
                "<p style='margin:0;font-size:14px;color:#717B8C;text-align:center'>" +
                "Nhấn vào nút bên dưới để xác nhận email của bạn:" +
                "</p>" +
                ctaButton(confirmationUrl, "Xác nhận Email →") +
                fallbackLink(confirmationUrl) +

                divider() +

                "<p style='margin:0;font-size:12px;color:#717B8C;text-align:center'>" +
                "⏰ Liên kết này sẽ hết hạn sau <strong>24 giờ</strong>. " +
                "Nếu bạn không đăng ký tài khoản, vui lòng bỏ qua email này." +
                "</p>";

        return wrapLayout(body);
    }

    private String featureItem(String icon, String text) {
        return "<td style='padding:8px 0'>" +
                "<span style='font-size:16px;margin-right:12px;vertical-align:middle'>" + icon + "</span>" +
                "<span style='font-size:14px;color:#243353;font-weight:500;vertical-align:middle'>" + text + "</span>" +
                "</td>";
    }

    /**
     * Template 2: Đặt lại mật khẩu
     */
    public String buildPasswordResetEmailHtml(String resetUrl) {
        String body =
                // Khối thông báo cảnh báo lồng Table thay vì dùng Flexbox (Chống vỡ giao diện email)
                "<table width='100%' cellpadding='0' cellspacing='0' border='0'" +
                "  style='background:#fffbeb;border:1px solid #f59e0b;border-radius:14px;margin-bottom:28px'>" + // --warning-bg & --warning
                "<tr>" +
                "  <td style='padding:16px 0 16px 20px;font-size:28px;width:40px;vertical-align:middle;'>🔐</td>" +
                "  <td style='padding:16px 20px 16px 12px;vertical-align:middle;'>" +
                "    <strong style='font-size:14px;color:#d97706;display:block;margin-bottom:2px'>Yêu cầu đặt lại mật khẩu</strong>" + // --warning-dark
                "    <span style='font-size:13px;color:#717B8C'>Chúng tôi đã nhận được một yêu cầu từ tài khoản của bạn.</span>" +
                "  </td>" +
                "</tr>" +
                "</table>" +

                "<h2 style='margin:0 0 12px;font-size:22px;font-weight:700;color:#243353;letter-spacing:-0.5px'>" +
                "Đặt lại mật khẩu" +
                "</h2>" +
                "<p style='margin:0 0 24px;font-size:15px;color:#717B8C;line-height:1.6'>" +
                "Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản tại <strong>" + appName + "</strong>. " +
                "Vui lòng nhấn vào nút bên dưới để tiến hành tạo mật khẩu mới an toàn:" +
                "</p>" +

                ctaButton(resetUrl, "Đặt lại mật khẩu →") +
                fallbackLink(resetUrl) +

                divider() +

                // Security tips
                "<p style='margin:0 0 12px;font-size:14px;font-weight:700;color:#243353'>💡 Lưu ý bảo mật quan trọng:</p>" +
                "<ul style='margin:0;padding-left:20px;font-size:13px;color:#717B8C;line-height:1.8'>" +
                "<li>Liên kết này chỉ có hiệu lực sử dụng trong vòng <strong>1 giờ</strong>.</li>" +
                "<li>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua để đảm bảo an toàn.</li>" +
                "<li>Tài khoản của bạn sẽ tuyệt đối không bị thay đổi trừ khi bạn click vào link trên.</li>" +
                "</ul>";

        return wrapLayout(body);
    }

    /**
     * Template 3: Thông báo chung
     */
    public String buildNotificationEmailHtml(String subject, String bodyText) {
        String body =
                "<h2 style='margin:0 0 16px;font-size:22px;font-weight:700;color:#243353;letter-spacing:-0.5px'>" +
                subject +
                "</h2>" +
                "<div style='font-size:15px;color:#243353;line-height:1.7'>" +
                bodyText +
                "</div>" +
                divider() +
                "<p style='margin:0;font-size:13px;color:#717B8C;text-align:center'>" +
                "Truy cập ngay " +
                "<a href='" + frontendUrl + "' style='color:#68A877;font-weight:600;text-decoration:none'>" + appName + "</a>" +
                " để xem thêm chi tiết lịch trình của bạn." +
                "</p>";

        return wrapLayout(body);
    }

    /**
     * Template 4: Đơn hàng đã được thợ nhận
     */
    public String buildOrderAcceptedEmailHtml(String customerName, String orderId,
                                              String technicianName, String scheduledTime) {
        String orderUrl = frontendUrl + "/customer/order-management";

        String body =
                // Status badge
                "<div style='text-align:center;margin-bottom:24px'>" +
                badge("Đơn hàng đã được nhận", "#ecfdf5", "#10b981") + // --success-bg & --success
                "</div>" +

                "<h2 style='margin:0 0 12px;font-size:22px;font-weight:700;color:#243353;text-align:center;letter-spacing:-0.5px'>" +
                "Kỹ thuật viên đang chuẩn bị đến! 🔧" +
                "</h2>" +
                "<p style='margin:0 0 28px;font-size:15px;color:#717B8C;line-height:1.6;text-align:center'>" +
                "Xin chào <strong style='color:#243353'>" + customerName + "</strong>,<br/>" +
                "Đơn đặt dịch vụ của bạn đã được kỹ thuật viên chấp nhận thành công. Lịch hẹn của bạn đã sẵn sàng!" +
                "</p>" +

                // Khối thông tin tối — Thay thế Navy bằng Slate Đậm thương hiệu (#243353)
                "<table width='100%' cellpadding='0' cellspacing='0' border='0'" +
                "  style='background:#243353;border-radius:16px;padding:24px 28px;margin-bottom:24px'>" + // --text-primary làm background cao cấp
                "<tr><td>" +
                "  <p style='margin:0 0 14px;font-size:12px;color:#caecce;letter-spacing:1.5px;text-transform:uppercase;font-weight:600'>" +
                "  Chi tiết đơn hàng dịch vụ" +
                "  </p>" +
                "  <table width='100%' cellpadding='0' cellspacing='0' border='0'>" +
                infoRowDark("Mã đơn hàng", "#" + orderId) +
                infoRowDark("Kỹ thuật viên", technicianName) +
                infoRowDark("Thời gian hẹn", scheduledTime) +
                "  </table>" +
                "</td></tr>" +
                "</table>" +

                // Tips chuẩn bị (Đồng bộ tone lá/xanh bảo mật)
                "<table width='100%' cellpadding='0' cellspacing='0' border='0'" +
                "  style='background:#ecfdf5;border-radius:12px;padding:16px 20px;margin-bottom:24px'>" +
                "<tr><td>" +
                "  <p style='margin:0 0 8px;font-size:14px;font-weight:700;color:#065f46'>📋 Chuẩn bị trước khi thợ đến:</p>" +
                "  <ul style='margin:0;padding-left:18px;font-size:13px;color:#065f46;line-height:1.8'>" +
                "  <li>Chuẩn bị không gian trống tại nơi cần xử lý thiết bị</li>" +
                "  <li>Có mặt tại địa điểm trước giờ hẹn khoảng 5 phút</li>" +
                "  <li>Chuẩn bị thông tin mô tả chi tiết hơn về tình trạng hư hỏng nếu có</li>" +
                "  </ul>" +
                "</td></tr>" +
                "</table>" +

                ctaButton(orderUrl, "Theo dõi đơn hàng →") +

                divider() +

                "<p style='margin:0;font-size:12px;color:#717B8C;text-align:center'>" +
                "Cần hỗ trợ gấp? Liên hệ hotline tổng đài <strong style='color:#243353'>1900 8888</strong> hoặc chat trực tiếp trên hệ thống." +
                "</p>";

        return wrapLayout(body);
    }

    private String infoRowDark(String label, String value) {
        return "<tr>" +
                "<td style='padding:8px 0;font-size:13px;color:rgba(255,255,255,0.65);width:45%'>" + label + "</td>" +
                "<td style='padding:8px 0;font-size:14px;color:#ffffff;font-weight:600'>" + value + "</td>" +
                "</tr>";
    }

    /**
     * Template 5: Đơn hàng hoàn thành
     */
    public String buildOrderCompletedEmailHtml(String customerName, String orderId, long finalPrice) {
        String reviewUrl = frontendUrl + "/customer/order-management";
        String formattedPrice = String.format("%,d", finalPrice).replace(",", ".") + "đ";

        String body =
                "<div style='text-align:center;margin-bottom:24px'>" +
                badge("Hoàn thành", "rgba(59, 130, 246, 0.1)", "#3b82f6") + // --blue-bg & --blue
                "</div>" +

                "<h2 style='margin:0 0 12px;font-size:22px;font-weight:700;color:#243353;text-align:center;letter-spacing:-0.5px'>" +
                "Dịch vụ đã hoàn thành xuất sắc! ✅" +
                "</h2>" +
                "<p style='margin:0 0 28px;font-size:15px;color:#717B8C;line-height:1.6;text-align:center'>" +
                "Xin chào <strong style='color:#243353'>" + customerName + "</strong>,<br/>" +
                "Đơn hàng <strong>#" + orderId + "</strong> đã hoàn tất sửa chữa. Cảm ơn bạn đã lựa chọn dịch vụ của " + appName + "!" +
                "</p>" +

                // Payment summary hóa đơn dịch vụ 
                "<table width='100%' cellpadding='0' cellspacing='0' border='0'" +
                "  style='background:#F7F8FB;border:1px solid #E2E8F0;border-radius:16px;padding:24px 28px;margin-bottom:24px'>" +
                "<tr><td>" +
                "  <p style='margin:0 0 14px;font-size:12px;color:#717B8C;letter-spacing:1px;text-transform:uppercase;font-weight:600'>Hoá đơn thanh toán</p>" +
                "  <table width='100%' cellpadding='0' cellspacing='0' border='0'>" +
                infoRow("Mã đơn hàng", "#" + orderId) +
                infoRow("Trạng thái thanh toán", "✅ Đã tất toán điện tử") +
                "  </table>" +
                "  <hr style='border:none;border-top:1px solid #E2E8F0;margin:16px 0'/>" +
                "  <table width='100%' cellpadding='0' cellspacing='0' border='0'>" +
                "  <tr>" +
                "    <td style='font-size:15px;font-weight:700;color:#243353'>Tổng chi phí</td>" +
                "    <td style='font-size:22px;font-weight:800;color:#68A877;text-align:right'>" + formattedPrice + "</td>" + // --primary highlight giá tiền xanh tươi tắn
                "  </tr>" +
                "  </table>" +
                "</td></tr>" +
                "</table>" +

                // Khối kêu gọi Review 
                "<table width='100%' cellpadding='0' cellspacing='0' border='0'" +
                "  style='background:#243353;border-radius:16px;padding:24px 28px;text-align:center;margin-bottom:24px'>" +
                "<tr><td>" +
                "  <p style='margin:0 0 6px;font-size:22px;letter-spacing:2px'>⭐⭐⭐⭐⭐</p>" +
                "  <p style='margin:0 0 4px;font-size:16px;font-weight:700;color:#ffffff'>Bạn thấy hài lòng về thợ không?</p>" +
                "  <p style='margin:0 0 18px;font-size:13px;color:rgba(255,255,255,0.7)'>" +
                "  Đánh giá của bạn giúp cộng đồng " + appName + " sàng lọc kỹ thuật viên tốt nhất." +
                "  </p>" +
                "  <a href='" + reviewUrl + "' style='" +
                "    display:inline-block;" +
                "    background:#68A877;" + // Nút CTA màu xanh 
                "    color:#ffffff;" +
                "    font-size:14px;" +
                "    font-weight:700;" +
                "    padding:12px 32px;" +
                "    border-radius:10px;" +
                "    text-decoration:none'>" +
                "  Gửi đánh giá ngay →" +
                "  </a>" +
                "</td></tr>" +
                "</table>" +

                "<p style='margin:0;font-size:12px;color:#717B8C;text-align:center'>" +
                "Vui lòng lưu ý, sản phẩm và linh kiện thay thế được hệ thống hỗ trợ bảo hành chính hãng trong vòng 3 tháng." +
                "</p>";

        return wrapLayout(body);
    }

    /**
     * Template 6: Nạp tiền thành công
     */
    public String buildTopUpSuccessEmailHtml(String fullName, long amount, String transactionId) {
        String formattedAmount = String.format("%,d", amount).replace(",", ".") + "đ";
        String walletUrl = frontendUrl + "/technician/wallet";

        String body =
                "<div style='text-align:center;margin-bottom:24px'>" +
                badge("Giao dịch thành công", "#ecfdf5", "#10b981") +
                "</div>" +

                "<h2 style='margin:0 0 12px;font-size:22px;font-weight:700;color:#243353;text-align:center;letter-spacing:-0.5px'>" +
                "Biến động số dư ví tài khoản! 💰" +
                "</h2>" +
                "<p style='margin:0 0 28px;font-size:15px;color:#717B8C;line-height:1.6;text-align:center'>" +
                "Xin chào kỹ thuật viên <strong style='color:#243353'>" + fullName + "</strong>,<br/>" +
                "Ví điện tử GlowUp của bạn đã được ghi nhận nạp tiền thành công." +
                "</p>" +

                // Khối thông số dòng tiền nổi bật (Đồng bộ Slate đậm + chữ màu Primary xanh sáng cực đẹp)
                "<table width='100%' cellpadding='0' cellspacing='0' border='0'" +
                "  style='background:#243353;border-radius:20px;padding:32px;text-align:center;margin-bottom:24px'>" +
                "<tr><td>" +
                "  <p style='margin:0 0 6px;font-size:12px;color:rgba(255,255,255,0.6);letter-spacing:1.5px;text-transform:uppercase;font-weight:600'>Số tiền đã nạp thực tế</p>" +
                "  <p style='margin:0 0 18px;font-size:40px;font-weight:800;color:#8fca97;letter-spacing:-1px'>" + formattedAmount + "</p>" + // --primary-light làm sáng bừng số tiền

                "  <table cellpadding='0' cellspacing='0' border='0' align='center'" +
                "    style='background:rgba(255,255,255,0.08);border-radius:8px;padding:8px 16px'>" +
                "  <tr>" +
                "    <td style='font-size:12px;color:rgba(255,255,255,0.6)'>Mã giao dịch:&nbsp;</td>" +
                "    <td style='font-size:13px;color:#ffffff;font-weight:600'>" + transactionId + "</td>" +
                "  </tr>" +
                "  </table>" +
                "</td></tr>" +
                "</table>" +

                // Chi tiết giao dịch
                "<table width='100%' cellpadding='0' cellspacing='0' border='0'" +
                "  style='background:#F7F8FB;border-line:1px solid #E2E8F0;border-radius:14px;padding:20px 24px;margin-bottom:24px'>" +
                "<tr><td>" +
                "  <table width='100%' cellpadding='0' cellspacing='0' border='0'>" +
                infoRow("Loại biến động", "Nạp tiền vào tài khoản thợ") +
                infoRow("Trạng thái hệ thống", "✅ Hoàn tất tức thì") +
                infoRow("Thời gian ghi nhận", "Bây giờ") +
                "  </table>" +
                "</td></tr>" +
                "</table>" +

                ctaButton(walletUrl, "Kiểm tra ví của tôi →") +

                divider() +

                "<p style='margin:0;font-size:12px;color:#717B8C;text-align:center'>" +
                "Nếu bạn hoàn toàn không nhận biết về hoạt động giao dịch này, vui lòng thông báo khẩn cấp cho hotline <strong style='color:#243353'>1900 8888</strong>." +
                "</p>";

        return wrapLayout(body);
    }
}