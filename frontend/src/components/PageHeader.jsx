import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const PageHeader = ({ breadcrumbs, title }) => {
  const { user } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-[#283039] px-6 py-4 bg-[#111418] z-10 shrink-0">
      <div className="flex items-center gap-4 lg:hidden">
        <button className="text-white">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h2 className="text-white text-lg font-bold">{title}</h2>
      </div>
      {/* Breadcrumbs (Desktop) */}
      <div className="hidden lg:flex items-center gap-2">
        {breadcrumbs.map((crumb, index) => (
          <div key={index} className="flex items-center gap-2">
            {index > 0 && (
              <span className="text-[#9dabb9] text-sm font-medium">/</span>
            )}
            {crumb.link ? (
              <Link
                to={crumb.link}
                className="text-[#9dabb9] text-sm font-medium hover:text-white transition-colors cursor-pointer"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="text-white text-sm font-medium">
                {crumb.label}
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <button className="text-[#9dabb9] hover:text-white transition-colors">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <div
          className="bg-center bg-no-repeat bg-cover rounded-full size-8 lg:hidden"
          style={{
            backgroundImage:
              "url('https://ui-avatars.com/api/?name=" +
              (user?.name || "User") +
              "&background=137fec&color=fff')",
          }}
        ></div>
      </div>
    </header>
  );
};

export default PageHeader;
