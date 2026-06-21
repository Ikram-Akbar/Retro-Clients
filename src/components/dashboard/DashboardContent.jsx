const DashboardContent = ({ children }) => {
  return (
    <main className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8">
      <div className="mx-auto max-w-7xl w-full">
        {children}
      </div>
    </main>
  );
};

export default DashboardContent;
