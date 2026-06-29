import React, { useEffect, useState } from 'react';
import { technicianService } from '../../services/technician/technicianService';
import type { CompletedProject } from '../../types/technician';
import './ProjectsTab.css';

interface ProjectsTabProps {
  technicianId?: string; // Nhận từ ProviderProfile.tsx truyền sang
}

export const ProjectsTab: React.FC<ProjectsTabProps> = ({ technicianId }) => {
  const [projects, setProjects] = useState<CompletedProject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompletedProjects = async () => {
      if (!technicianId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        // Gọi API thật từ backend thông qua service đã bổ sung phương thức
        const data = await technicianService.getCompletedProjects(technicianId);
        setProjects(data);
      } catch (err) {
        console.error('Lỗi khi tải danh sách dự án hoàn thành:', err);
        setError('Không thể tải danh sách dự án đã làm. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedProjects();
  }, [technicianId]);

  // Hiển thị trạng thái Loading
  if (loading) {
    return (
      <div className="projects-status-loading">
        Đang tải danh sách dự án...
      </div>
    );
  }

  // Hiển thị trạng thái Lỗi
  if (error) {
    return (
      <div className="projects-status-error">
        {error}
      </div>
    );
  }

  // Hiển thị trạng thái mảng rỗng (Chưa có đơn hàng COMPLETED)
  if (projects.length === 0) {
    return (
      <div className="projects-status-empty">
        Kỹ thuật viên chưa có dự án nào hoàn thành.
      </div>
    );
  }

  return (
    <div className="projects-grid">
      {projects.map((project) => (
        <div key={project.id} className="project-card">
          {/* Khối nội dung chi tiết đơn hàng */}
          <div className="project-card-content">
            <div>
              {/* Hiển thị Danh mục dịch vụ */}
              <div className="project-category">
                {project.serviceCategory}
              </div>

              {/* Hiển thị Tên dịch vụ */}
              <h4 className="project-title">
                {project.serviceName}
              </h4>
              
              {/* Hiển thị Tên thiết bị */}
              <div className="project-device">
                🛠️ Thiết bị: {project.deviceName}
              </div>
              
              {/* Hiển thị Mô tả chi tiết công việc */}
              <p className="project-description">
                {project.description}
              </p>
            </div>
            
            {/* Thanh footer phụ của thẻ thông tin */}
            <div className="project-footer">
              <span>Mã đơn hàng: {project.code}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};