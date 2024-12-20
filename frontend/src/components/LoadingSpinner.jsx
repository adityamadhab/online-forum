function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-blue-200 dark:border-blue-900"></div>
        <div className="w-12 h-12 rounded-full border-4 border-blue-500 dark:border-blue-400 border-t-transparent animate-spin absolute top-0"></div>
      </div>
    </div>
  );
}

export default LoadingSpinner; 