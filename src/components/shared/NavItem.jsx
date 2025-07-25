const NavItem = ({ icon, text, active, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-colors ${
      active
        ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-semibold"
        : "hover:bg-gray-100 dark:hover:bg-gray-700"
    }`}
  >
    {icon}
    <span>{text}</span>
    {badge > 0 && (
      <span className="ml-auto bg-indigo-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
        {badge}
      </span>
    )}
  </button>
);

export default NavItem;
