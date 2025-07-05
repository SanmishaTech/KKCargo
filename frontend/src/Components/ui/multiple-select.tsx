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

type MultipleSelectProps = {
  tags: TTag[];
  customTag?: (item: TTag) => ReactNode | string;
  onChange?: (value: TTag[]) => void;
  defaultValue?: TTag[];
};

export const MultipleSelect = ({
  tags,
  customTag,
  onChange,
  defaultValue,
}: MultipleSelectProps) => {
  // Generate a unique ID for this component instance to prevent cross-instance state interference
  const instanceIdRef = useRef<string>(Math.random().toString(36).substring(2, 9));
  
  // Initialize state with a default value, ensuring it's a new array reference
  const [selected, setSelected] = useState<TTag[]>(() => 
    defaultValue ? [...defaultValue] : []
  );
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Only update selected state when defaultValue changes and is different from current state
  // Using JSON.stringify for deep comparison of arrays to prevent infinite updates
  useEffect(() => {
    if (defaultValue && JSON.stringify(defaultValue) !== JSON.stringify(selected)) {
      console.log(`MultipleSelect [${instanceIdRef.current}]: updating selected state`, defaultValue);
      // Create a new array reference to ensure proper state updates
      setSelected([...defaultValue]);
    }
  }, [defaultValue]); // deliberately excluding selected from dependencies

  // Handle UI scroll and trigger onChange only on user-initiated changes
  useEffect(() => {
    if (containerRef?.current) {
      containerRef.current.scrollBy({
        left: containerRef.current?.scrollWidth,
        behavior: 'smooth',
      });
    }
  }, [selected]);

  // No need for a separate function since we call onChange directly from select/deselect

  const onSelect = (item: TTag) => {
    // Create a new array and add the item
    const newSelected = [...selected, { ...item }];
    // Log which instance is updating and with what value
    console.log(`MultipleSelect [${instanceIdRef.current}]: selecting item`, item, newSelected);
    // Update internal state
    setSelected(newSelected);
    // Notify parent with a new array reference
    onChange?.(JSON.parse(JSON.stringify(newSelected))); 
  };

  const onDeselect = (item: TTag) => {
    // Create a new filtered array
    const newSelected = selected.filter((i) => i.key !== item.key);
    // Log which instance is updating and with what value
    console.log(`MultipleSelect [${instanceIdRef.current}]: deselecting item`, item, newSelected);
    // Update internal state
    setSelected(newSelected);
    // Notify parent with a new array reference
    onChange?.(JSON.parse(JSON.stringify(newSelected)));
  };

  return (
    <AnimatePresence mode={'popLayout'}>
      <div className={'flex w-[300px] flex-col gap-2'}>
        <motion.div
          layout
          ref={containerRef}
          className='selected no-scrollbar flex h-12 w-full items-center overflow-x-scroll scroll-smooth rounded-md border border-solid border-gray-200 bg-gray-50 p-2'
        >
          <motion.div layout className='flex items-center gap-2'>
            {selected?.map((item) => (
              <Tag
                name={item?.key}
                key={item?.key}
                className={'bg-white shadow'}
              >
                <div className='flex items-center gap-2'>
                  <motion.span layout className={'text-nowrap'}>
                    {item?.name}
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
                  name={item?.key}
                  onClick={() => onSelect(item)}
                  key={item?.key}
                >
                  {customTag ? (
                    customTag(item)
                  ) : (
                    <motion.span layout className={'text-nowrap'}>
                      {item?.name}
                    </motion.span>
                  )}
                </Tag>
              ))}
          </div>
        )}
      </div>
    </AnimatePresence>
  );
};

type TagProps = PropsWithChildren &
  Pick<HTMLAttributes<HTMLDivElement>, 'onClick'> & {
    name?: string;
    className?: string;
  };

export const Tag = ({ children, className, name, onClick }: TagProps) => {
  return (
    <motion.div
      layout
      layoutId={name}
      onClick={onClick}
      className={(
        `cursor-pointer rounded-md bg-gray-200 px-2 py-1 text-sm ${className}`
      )}
    >
      {children}
    </motion.div>
  );
};
