import { type ReactNode } from 'react';

interface LayoutProps {
    children: ReactNode;
}

const SectionLayout = ({ children }: LayoutProps) => {
    return (
        <div className="max-w-7xl mx-auto px-7 md:px-15 ">
            {children}
        </div>
    );
};

export default SectionLayout;
