import { type ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
}

const Layout = ({ children, header, footer }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {header && (
        <header className="sticky top-0 z-50  ">
          {header}
        </header>
      )}


      <div className="flex flex-1">

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      {footer && (
        <footer className=" border-t border-gray-200 shadow-sm">
          {footer}
        </footer>
      )}
    </div>
  );
};

export default Layout;
