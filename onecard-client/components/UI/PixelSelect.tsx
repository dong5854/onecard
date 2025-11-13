'use client';

import {
	useCallback,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
} from 'react';
import styles from '@/components/UI/PixelSelect.module.css';

interface PixelSelectOption<T extends string> {
	value: T;
	label: string;
	disabled?: boolean;
}

interface PixelSelectProps<T extends string> {
	value: T;
	options: PixelSelectOption<T>[];
	onChange: (value: T) => void;
	placeholder?: string;
	className?: string;
	ariaLabel?: string;
}

export default function PixelSelect<T extends string>({
	value,
	options,
	onChange,
	placeholder = 'Select',
	className,
	ariaLabel,
}: PixelSelectProps<T>) {
	const containerRef = useRef<HTMLDivElement>(null);
	const listboxId = useId();
	const [isOpen, setIsOpen] = useState(false);
	const [highlightedIndex, setHighlightedIndex] = useState(() =>
		Math.max(
			0,
			options.findIndex(option => option.value === value && !option.disabled),
		),
	);

	const mergedOptions = useMemo(() => options, [options]);

	useEffect(() => {
		setHighlightedIndex(prev => {
			const nextIndex = mergedOptions.findIndex(
				option => option.value === value && !option.disabled,
			);
			return nextIndex >= 0 ? nextIndex : prev;
		});
	}, [mergedOptions, value]);

	const close = useCallback(() => setIsOpen(false), []);

	useEffect(() => {
		if (!isOpen) return;
		const handleClickOutside = (event: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				close();
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [isOpen, close]);

	const selectOption = useCallback(
		(index: number) => {
			const option = mergedOptions[index];
			if (!option || option.disabled) return;
			onChange(option.value);
			setHighlightedIndex(index);
			close();
		},
		[mergedOptions, onChange, close],
	);

	const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		switch (event.key) {
			case ' ':
			case 'Enter': {
				event.preventDefault();
				if (isOpen) {
					selectOption(highlightedIndex);
				} else {
					setIsOpen(true);
				}
				break;
			}
			case 'ArrowDown': {
				event.preventDefault();
				setIsOpen(true);
				setHighlightedIndex(prev => {
					for (
						let i = (prev + 1) % mergedOptions.length;
						i !== prev;
						i = (i + 1) % mergedOptions.length
					) {
						if (!mergedOptions[i].disabled) return i;
					}
					return prev;
				});
				break;
			}
			case 'ArrowUp': {
				event.preventDefault();
				setIsOpen(true);
				setHighlightedIndex(prev => {
					for (
						let i = (prev - 1 + mergedOptions.length) % mergedOptions.length;
						i !== prev;
						i = (i - 1 + mergedOptions.length) % mergedOptions.length
					) {
						if (!mergedOptions[i].disabled) return i;
					}
					return prev;
				});
				break;
			}
			case 'Escape': {
				if (isOpen) {
					event.preventDefault();
					close();
				}
				break;
			}
		}
	};

	const selectedOption = mergedOptions.find(option => option.value === value);

	return (
		<div
			ref={containerRef}
			className={`${styles.container} ${className ?? ''}`.trim()}
			tabIndex={0}
			role="combobox"
			aria-haspopup="listbox"
			aria-expanded={isOpen}
			aria-controls={isOpen ? listboxId : undefined}
			aria-label={ariaLabel ?? placeholder}
			onKeyDown={handleKeyDown}
		>
			<div
				className={styles.displayValue}
				data-empty={!selectedOption}
				onClick={() => setIsOpen(prev => !prev)}
			>
				{selectedOption ? selectedOption.label : placeholder}
				<span className={styles.chevron} aria-hidden>
					{isOpen ? '▲' : '▼'}
				</span>
			</div>
			{isOpen && (
				<ul id={listboxId} className={styles.optionList} role="listbox">
					{mergedOptions.map((option, index) => (
						<li
							key={option.value}
							role="option"
							aria-selected={option.value === value}
							data-highlighted={index === highlightedIndex ? 'true' : undefined}
							data-disabled={option.disabled ? 'true' : undefined}
							onMouseEnter={() =>
								!option.disabled && setHighlightedIndex(index)
							}
							onMouseDown={event => event.preventDefault()}
							onClick={() => selectOption(index)}
						>
							{option.label}
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
