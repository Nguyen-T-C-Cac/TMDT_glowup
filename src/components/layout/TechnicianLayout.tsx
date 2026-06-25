import React from 'react';
import {TechnicianSidebar} from "./TechnicianSidebar.tsx";
import TechnicianHeader from "./TechnicianHeader.tsx";
import {Footer} from "./Footer.tsx";
import "./layout.css"

interface LayoutProps {
    children: React.ReactNode;
    activeItem?: string;
}

export const TechnicianLayout: React.FC<LayoutProps> = ({ children, activeItem }) => {
    const isChatLayout = activeItem === 'chat';

    return (
        <div className={`app-wrapper ${isChatLayout ? 'app-wrapper--chat' : ''}`}>
            <div className={`tech-layout-container ${isChatLayout ? 'tech-layout-container--chat' : ''}`}>
                <TechnicianSidebar activeItem={activeItem} />

                <div className={`tech-main-wrapper ${isChatLayout ? 'tech-main-wrapper--chat' : ''}`}>
                    <TechnicianHeader />
                    <main className={`tech-content-area ${isChatLayout ? 'tech-content-area--chat' : ''}`}>
                        {children}
                    </main>
                </div>
            </div>

            {!isChatLayout && <Footer />}
        </div>
    );
};

export default TechnicianLayout;
