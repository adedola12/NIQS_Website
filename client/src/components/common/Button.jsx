import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Reusable button component.
 *
 * Props:
 *  - variant: 'primary' | 'gold' | 'outline' | 'ghost'  (default: 'primary')
 *  - to: string        — if provided, renders a react-router Link
 *  - href: string      — if provided, renders an <a> tag
 *  - children: node
 *  - className: string — extra classes
 *  - ...rest            — forwarded to the underlying element
 */
const variantClassMap = {
  primary: 'btn bp',
  gold: 'btn bg',
  outline: 'btn bo',
  ghost: 'btn btn-ghost',
};

const Button = ({
  variant = 'primary',
  to,
  href,
  children,
  className = '',
  ...rest
}) => {
  const classes = `${variantClassMap[variant] || variantClassMap.primary} ${className}`.trim();

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
};

export default Button;
