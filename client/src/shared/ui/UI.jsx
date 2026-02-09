import { useId } from "react";

export const Input = ({ label, className = "", ...props }) => {
  const id = useId();
  return (
    <div>
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
        </label>
      )}
      <input id={id} className={`input ${className}`} {...props} />
    </div>
  );
};

export const Button = ({
  variant = "primary",
  className = "",
  children,
  ...props
}) => {
  const variantClass = {
    primary: "btn btn-primary",
    secondary: "btn btn-secondary",
    ghost: "btn btn-ghost",
  };

  return (
    <button className={`${variantClass[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
