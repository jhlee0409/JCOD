'use client';

import { useRef, useState } from 'react';
import { AddButton } from './Button';

const Form = ({
  onSubmit,
}: {
  onSubmit: (formData: FormData) => Promise<boolean>;
}) => {
  const [hasError, setHasError] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (formData: FormData) => {
    setHasError(false);
    const res = await onSubmit(formData);
    if (!res) {
      setHasError(true);
      return;
    }
    formRef?.current?.reset();
  };

  return (
    <form action={handleSubmit} ref={formRef} className='flex gap-2  mb-6'>
      <div className='relative'>
        <input
          name='title'
          type='text'
          className='rounded-md px-4 py-2 bg-inherit border'
          aria-invalid={hasError}
        />
        {hasError ? (
          <span className='absolute inline-block w-full bottom-[-30px] right-0'>
            내용을 적어주세요
          </span>
        ) : null}
      </div>
      <AddButton />
    </form>
  );
};

export default Form;
