'use client';

import {
  HTMLAttributes,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import * as React from 'react';

export type TTag = {
  key: string;
  name: string;
};

type SemesterSelectProps = {
  tags: TTag[];
  customTag?: (item: TTag) => ReactNode | string;
  onChange?: (value: TTag[]) => void;
  defaultValue?: TTag[];
  placeholder?: string;
  emptyIndicator?: React.ReactNode;
};

export const SemesterSelect = ({
  tags,
  customTag,
  onChange,
  defaultValue,
  placeholder = "Select semesters",
  emptyIndicator,
}: SemesterSelectProps) => {
  // Initialize state with defaultValue or empty array
  const [selected, setSelected] = useState<TTag[]>(defaultValue || []);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Update selected state when defaultValue changes
  useEffect(() => {
    if (defaultValue) {
      setSelected([...defaultValue]);
    }
  }, [defaultValue]);

  // Handle UI scroll
  useEffect(() => {
    if (containerRef?.current) {
      containerRef.current.scrollBy({
        left: containerRef.current?.scrollWidth,
        behavior: 'smooth',
      });
    }
  }, [selected]);

  const onSelect = (item: TTag) => {
    const newSelected = [...selected, { ...item }];
    setSelected(newSelected);
    onChange?.(newSelected); 
  };

  const onDeselect = (item: TTag) => {
    const newSelected = selected.filter((i) => i.key !== item.key);
    setSelected(newSelected);
    onChange?.(newSelected);
  };

  return (
    <AnimatePresence mode={'popLayout'}>
      <div className={'flex w-full sm:w-[300px] lg:w-[235px] flex-col gap-2'}>
      <motion.div
          layout
          ref={containerRef}
          className='selected no-scrollbar flex h-12 w-full items-center overflow-x-scroll scroll-smooth rounded-md border border-solid border-gray-200 bg-gray-50 p-2'
        >
          <motion.div layout className='flex items-center gap-2'>
            {selected.map((item) => (
              <Tag
                name={item.key}
                key={item.key}
                className={'bg-white shadow'}
              >
                <div className='flex items-center gap-2'>
                  <motion.span layout className={'text-nowrap'}>
                    {item.name}
                  </motion.span>
                  <button className={''} onClick={() => onDeselect(item)}>
                    <X size={14} />
                  </button>
                </div>
              </Tag>
            ))}
          </motion.div>
        </motion.div>
        {tags?.length > selected?.length && (
          <div className='flex w-full flex-wrap gap-2 rounded-md border border-solid border-gray-200 p-2'>
            {tags
              ?.filter((item) => !selected?.some((i) => i.key === item.key))
              .map((item) => (
                <Tag
                  key={item.key}
                  name={item.key}
                  onClick={() => onSelect(item)}
                  className='bg-gray-50 cursor-pointer hover:bg-gray-100'
                >
                  {customTag ? (
                    customTag(item)
                  ) : (
                    <motion.span layout>{item.name}</motion.span>
                  )}
                </Tag>
              ))}
          </div>
        )}
        {tags?.length === 0 && emptyIndicator}
      </div>
    </AnimatePresence>
  );
};

type TagProps = {
  name?: string;
  className?: string;
} & HTMLAttributes<HTMLDivElement>;

const Tag = ({
  children,
  className,
  name,
  onClick,
  ...props
}: PropsWithChildren<TagProps>) => {
  return (
    <motion.div
      layout
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      key={name}
      className={`rounded-full border border-solid px-2 py-1 text-xs ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
};
