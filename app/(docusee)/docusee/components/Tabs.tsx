import React, { useState } from 'react';
import './Tabs.css';

// Tab 컴포넌트의 Props 타입 정의
interface TabProps {
    label: string;
    children?: React.ReactNode;
}

// Tab 컴포넌트
export const Tab: React.FC<TabProps> = ({ children }) => {
    return <>{children}</>;
};

// Tabs 컴포넌트의 Props 타입 정의
interface TabsProps {
    children: React.ReactNode; // 더 일반적인 타입으로 변경
}

// Tabs 컴포넌트
const Tabs: React.FC<TabsProps> = ({ children }) => {
    const validChildren = React.Children.toArray(children) as React.ReactElement<TabProps>[];
    const [activeTab, setActiveTab] = useState(validChildren[0].props.label);

    const handleClick = (label: string) => {
        setActiveTab(label);
    };

    return (
        <div className="tabs-container">
            <div className="tabs" role="tablist">
                {validChildren.map((tab) => {
                    const { label } = tab.props;
                    return (
                        <button
                            key={label}
                            className={`tab-button ${activeTab === label ? 'active' : ''}`}
                            onClick={() => handleClick(label)}
                            role="tab"
                            aria-selected={activeTab === label}
                            aria-controls={`panel-${label}`}
                            id={`tab-${label}`}
                            tabIndex={activeTab === label ? 0 : -1}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    handleClick(label);
                                }
                            }}
                        >
                            {label}
                        </button>
                    );
                })}
            </div>
            <div className="tab-content">
                {validChildren.map((tab) => {
                    const isActive = tab.props.label === activeTab;
                    return (
                        <div
                            key={tab.props.label}
                            id={`panel-${tab.props.label}`}
                            role="tabpanel"
                            aria-labelledby={`tab-${tab.props.label}`}
                            className={`tab-pane ${isActive ? 'active' : 'hidden'}`}
                        >
                            {tab.props.children}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Tabs;