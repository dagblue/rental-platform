'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { listingsApi } from '@/lib/api/listings';
import { ArrowLeft, ArrowRight, Check, Camera, Upload, X } from 'lucide-react';

const schema = z.object({
  title:                  z.string().min(5, 'At least 5 characters'),
  description:            z.string().min(20, 'At least 20 characters'),
  categoryId:             z.string().min(1, 'Required'),
  condition:              z.enum(['NEW','LIKE_NEW','GOOD','FAIR','POOR']),
  pricePerDay:            z.coerce.number().min(1, 'Required'),
  minimumRentalDays:      z.coerce.number().min(1).default(1),
  region:                 z.string().min(1, 'Required'),
  city:                   z.string().min(1, 'Required'),
  subcity:                z.string().optional(),
  woreda:                 z.string().optional(),
  brand:                  z.string().optional(),
  model:                  z.string().optional(),
  yearOfManufacture:      z.coerce.number().optional(),
  cancellationPolicy:     z.enum(['FLEXIBLE','MODERATE','STRICT']),
  requiresGuarantor:      z.boolean().default(false),
  requiresIdVerification: z.boolean().default(true),
  requiresDeposit:        z.boolean().default(false),
  deliveryAvailable:      z.boolean().default(false),
  currency:               z.string().default('ETB'),
  pickupRequired:         z.boolean().default(true),
  minTrustLevel:          z.string().default('BASIC'),
});

type FormValues = z.infer<typeof schema>;

const STEPS = ['Basics & Photos', 'Location & Specs', 'Policies & Finalize'];

const CATEGORIES = ['cameras','electronics','vehicles','furniture','tools','sports','books','clothing','other'];
const CONDITIONS  = [{ v: 'NEW', l: 'Brand New' }, { v: 'LIKE_NEW', l: 'Like New' }, { v: 'GOOD', l: 'Good' }, { v: 'FAIR', l: 'Fair' }, { v: 'POOR', l: 'Poor' }];
const REGIONS     = ['ADDIS_ABABA','OROMIA','AMHARA','TIGRAY','SIDAMA','AFAR','SOMALI','BENISHANGUL_GUMUZ','GAMBELA','HARARI','DIRE_DAWA','SOUTHERN','SOUTH_WEST'];
const POLICIES    = [{ v: 'FLEXIBLE', l: 'Flexible (1 day notice)' }, { v: 'MODERATE', l: 'Moderate (3 days notice)' }, { v: 'STRICT', l: 'Strict (7 days notice)' }];

export default function CreateListingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      currency: 'ETB', pickupRequired: true, minTrustLevel: 'BASIC',
      cancellationPolicy: 'MODERATE', condition: 'GOOD',
      requiresGuarantor: false, requiresIdVerification: true,
      requiresDeposit: false, deliveryAvailable: false, minimumRentalDays: 1,
    },
  });

  const watchFields = watch();

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(prev => [...prev, ...files].slice(0, 5));
  };
  const removeImage = (i: number) => setImages(prev => prev.filter((_, idx) => idx !== i));

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const res = await listingsApi.createListing({
        ...data,
        rules: [],
        depositAmount: undefined,
        deliveryFee: undefined,
        pricePerWeek: undefined,
        pricePerMonth: undefined,
        maximumRentalDays: undefined,
      });
      if (res.success) {
        const id = res.data.id;
        setCreatedId(id);
        // Upload images if any
        if (images.length > 0) {
          setUploadingImages(true);
          await Promise.allSettled(images.map(f => listingsApi.uploadImage(id, f)));
          setUploadingImages(false);
        }
        toast.success('Listing created successfully!');
        router.push(`/dashboard/listings/success?id=${id}`);
      }
    } catch {
      toast.error('Failed to create listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  const err = (field: keyof FormValues) =>
    errors[field]?.message ? (
      <p className="text-xs text-red-500 mt-1">{errors[field]?.message as string}</p>
    ) : null;

  const inputCls = "w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary focus:bg-white transition-all";
  const selectCls = `${inputCls} cursor-pointer`;
  const checkboxRow = (id: string, label: string, field: keyof FormValues, desc?: string) => (
    <label htmlFor={id} className="flex items-start gap-3 cursor-pointer group">
      <input
        type="checkbox"
        id={id}
        checked={!!watch(field)}
        onChange={e => setValue(field, e.target.checked as any)}
        className="mt-0.5 w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
      />
      <div>
        <p className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{label}</p>
        {desc && <p className="text-xs text-slate-400">{desc}</p>}
      </div>
    </label>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => step > 1 ? setStep(s => s - 1) : router.back()}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create New Listing</h1>
          <p className="text-slate-500 text-sm">
            Step {step} of {STEPS.length}: <span className="font-semibold text-slate-700">{STEPS[step - 1]}</span>
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-primary h-full rounded-full transition-all duration-300"
          style={{ width: `${(step / STEPS.length) * 100}%` }}
        />
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-between">
        {STEPS.map((label, idx) => {
          const n = idx + 1;
          const done = n < step;
          const active = n === step;
          return (
            <div key={n} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                done ? 'bg-primary text-white' : active ? 'bg-primary/10 text-primary border-2 border-primary' : 'bg-slate-100 text-slate-400'
              }`}>
                {done ? <Check className="w-3.5 h-3.5" /> : n}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${active ? 'text-slate-900' : 'text-slate-400'}`}>{label}</span>
              {idx < STEPS.length - 1 && <div className="flex-1 h-px bg-slate-200 mx-2 hidden sm:block w-8" />}
            </div>
          );
        })}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white rounded-xl border p-6 space-y-5">

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Listing Title *</label>
                <input className={inputCls} placeholder="e.g. Professional Camera Sony A7III" {...register('title')} />
                {err('title')}
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Description *</label>
                <textarea
                  className={`${inputCls} h-28 py-2.5 resize-none`}
                  placeholder="Describe your item, its features, what's included..."
                  {...register('description')}
                />
                {err('description')}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">Category *</label>
                  <select className={selectCls} {...register('categoryId')}>
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                  {err('categoryId')}
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">Condition *</label>
                  <select className={selectCls} {...register('condition')}>
                    {CONDITIONS.map(c => <option key={c.v} value={c.v}>{c.l}</option>)}
                  </select>
                  {err('condition')}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">Price per Day (ETB) *</label>
                  <input type="number" min="1" className={inputCls} placeholder="500" {...register('pricePerDay')} />
                  {err('pricePerDay')}
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">Min Rental Days</label>
                  <input type="number" min="1" className={inputCls} {...register('minimumRentalDays')} />
                </div>
              </div>

              {/* Photos */}
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                  Photos <span className="text-slate-400 font-normal">({images.length}/5)</span>
                </label>
                <div className="grid grid-cols-5 gap-3">
                  {images.map((file, i) => (
                    <div key={i} className="aspect-square rounded-lg overflow-hidden relative bg-slate-100 group">
                      <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {images.length < 5 && (
                    <label className="aspect-square border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50 hover:border-primary/40 transition-colors">
                      <Camera className="w-5 h-5 mb-1" />
                      <span className="text-[10px] font-medium">Add</span>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageAdd} />
                    </label>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-2">Add up to 5 clear photos. First photo is the cover.</p>
              </div>
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">Region *</label>
                  <select className={selectCls} {...register('region')}>
                    <option value="">Select region</option>
                    {REGIONS.map(r => (
                      <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                  {err('region')}
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">City *</label>
                  <input className={inputCls} placeholder="e.g. Addis Ababa" {...register('city')} />
                  {err('city')}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">Subcity</label>
                  <input className={inputCls} placeholder="e.g. Bole" {...register('subcity')} />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">Woreda</label>
                  <input className={inputCls} placeholder="e.g. 03" {...register('woreda')} />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">Technical Details <span className="text-slate-400 font-normal">(optional)</span></h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 block mb-1.5">Brand</label>
                    <input className={inputCls} placeholder="Sony" {...register('brand')} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1.5">Model</label>
                    <input className={inputCls} placeholder="A7III" {...register('model')} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1.5">Year</label>
                    <input type="number" className={inputCls} placeholder="2022" {...register('yearOfManufacture')} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3 ── */}
          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Cancellation Policy *</label>
                <select className={selectCls} {...register('cancellationPolicy')}>
                  {POLICIES.map(p => <option key={p.v} value={p.v}>{p.l}</option>)}
                </select>
              </div>

              <div className="border-t pt-4 space-y-4">
                <h3 className="text-sm font-semibold text-slate-700">Rental Requirements</h3>
                {checkboxRow('r-guarantor', 'Requires a Physical Guarantor', 'requiresGuarantor', 'Renter must provide a guarantor')}
                {checkboxRow('r-id', 'Requires ID Verification', 'requiresIdVerification', 'Renter must verify their identity')}
                {checkboxRow('r-deposit', 'Requires Security Deposit', 'requiresDeposit', 'Refundable deposit on return')}
                {checkboxRow('r-delivery', 'Delivery Available', 'deliveryAvailable', 'You can deliver to the renter')}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-xs text-amber-800 leading-relaxed">
                  By listing your item, you agree to our Terms of Service and Rental Policies.
                  Make sure your item description is accurate to avoid disputes.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={() => step > 1 ? setStep(s => s - 1) : router.back()}
            className="px-5 py-2.5 text-sm font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            {step === 1 ? 'Cancel' : 'Previous'}
          </button>

          {step < STEPS.length ? (
            <button
              type="button"
              onClick={() => setStep(s => s + 1)}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold text-sm px-5 py-2.5 rounded-lg transition-colors"
            >
              Next Step <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold text-sm px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {uploadingImages ? 'Uploading photos…' : 'Creating…'}
                </>
              ) : (
                <><Check className="w-4 h-4" /> Create Listing</>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
