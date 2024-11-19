'use client';
import { ButtonHTMLAttributes } from 'react';
import { useFormStatus } from 'react-dom';

export const AddButton = (props: ButtonHTMLAttributes<HTMLButtonElement>) => {
  const { pending } = useFormStatus();

  return (
    <button
      aria-disabled={pending || props.disabled}
      disabled={pending || props.disabled}
      type='submit'
      {...props}
    >
      Add
    </button>
  );
};
