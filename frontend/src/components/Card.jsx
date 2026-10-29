
export const Card = ({ children, className }) => {
  return (
    <div className={`flex min-h-screen w-full items-center justify-center overflow-y-auto bg-linear-65 from-purple-500 to-green-500 ${className}`}>
      {children}
    </div>
  );
};
