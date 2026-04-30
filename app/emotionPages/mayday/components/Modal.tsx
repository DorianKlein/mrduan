import type { ComponentType, SVGProps } from "react";

type FruitInfo = {
	name: string;
	blessing: string;
	icon: ComponentType<SVGProps<SVGSVGElement>>;
};

type ModalProps = {
	open: boolean;
	fruit: FruitInfo;
	onReset: () => void;
};

export function Modal({ open, fruit, onReset }: ModalProps) {
	if (!open) {
		return null;
	}

	const FruitIcon = fruit.icon;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-5 py-6 backdrop-blur-sm">
			<div className="w-full max-w-sm rounded-[28px] border border-white/70 bg-white/95 px-6 py-7 text-center text-slate-900 shadow-[0_30px_100px_rgba(0,0,0,0.22)]">
				<div className="mx-auto mb-4 flex h-18 w-18 items-center justify-center rounded-full bg-linear-to-br from-emerald-50 to-amber-50">
					<FruitIcon className="h-12 w-12" />
				</div>
				<p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600">劳动节快乐</p>
				<h2 className="mt-3 text-2xl font-semibold tracking-tight">{fruit.name}</h2>
				<p className="mt-3 text-sm leading-7 text-slate-600">{fruit.blessing}</p>
				<button
					type="button"
					onClick={onReset}
					className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-slate-900 px-6 text-sm font-medium text-white transition-transform duration-200 active:scale-[0.98]"
				>
					再摘一次
				</button>
			</div>
		</div>
	);
}