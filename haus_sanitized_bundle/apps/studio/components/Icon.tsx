
import React from 'react';

interface IconProps {
  name: string;
  className?: string;
}

const Icon = ({ name, className }: IconProps) => {
  return <i data-lucide={name} className={className}></i>;
};

export default Icon;