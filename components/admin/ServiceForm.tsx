import type { Service, ServiceVariant } from "@/lib/supabase/types";
import { Button } from "@/components/ui/Button";
import { saveServiceAction, saveVariantAction } from "@/app/admin/(dashboard)/services/actions";

export function ServiceForm({ service }: { service?: Service | null }) {
  return (
    <form action={saveServiceAction} className="admin-form">
      {service ? <input type="hidden" name="id" value={service.id} /> : null}
      <div className="form-grid">
        <label>Name<input className="field-control" name="name" defaultValue={service?.name ?? ""} required /></label>
        <label>Slug<input className="field-control" name="slug" defaultValue={service?.slug ?? ""} required pattern="[a-z0-9]+(-[a-z0-9]+)*" /></label>
      </div>
      <div className="form-grid">
        <label>Category<input className="field-control" name="category" defaultValue={service?.category ?? ""} /></label>
        <label>Sort order<input className="field-control" name="sortOrder" type="number" min="0" defaultValue={service?.sort_order ?? 0} /></label>
      </div>
      <label>Short description<input className="field-control" name="shortDescription" defaultValue={service?.short_description ?? ""} /></label>
      <label>Full description<textarea className="field-control field-control--textarea" name="description" defaultValue={service?.description ?? ""} /></label>
      <label>Image URL<input className="field-control" name="imageUrl" type="url" defaultValue={service?.image_url ?? ""} /></label>
      <fieldset className="admin-fieldset">
        <legend>Booking mode</legend>
        <label><input type="radio" name="bookingMode" value="inquiry" defaultChecked={!service || service.booking_mode === "inquiry"} /> Inquiry</label>
        <label><input type="radio" name="bookingMode" value="direct" defaultChecked={service?.booking_mode === "direct"} /> Direct</label>
      </fieldset>
      <div className="admin-checks">
        <label><input type="checkbox" name="active" defaultChecked={service?.active ?? true} /> Active</label>
        <label><input type="checkbox" name="featured" defaultChecked={service?.featured ?? false} /> Featured</label>
      </div>
      <Button type="submit">{service ? "Save service" : "Create service"}</Button>
    </form>
  );
}

export function VariantForm({ serviceId, variant }: { serviceId: string; variant?: ServiceVariant | null }) {
  return (
    <form action={saveVariantAction} className="admin-form admin-form--compact">
      <input type="hidden" name="serviceId" value={serviceId} />
      {variant ? <input type="hidden" name="variantId" value={variant.id} /> : null}
      <div className="form-grid">
        <label>Variant name<input className="field-control" name="variantName" defaultValue={variant?.name ?? ""} required /></label>
        <label>Currency<input className="field-control" name="currency" defaultValue={variant?.currency ?? "USD"} maxLength={3} /></label>
      </div>
      <div className="form-grid form-grid--three">
        <label>Duration<input className="field-control" name="durationMinutes" type="number" min="0" defaultValue={variant?.duration_minutes ?? ""} /></label>
        <label>Setup<input className="field-control" name="setupMinutes" type="number" min="0" defaultValue={variant?.setup_minutes ?? ""} /></label>
        <label>Cleanup<input className="field-control" name="cleanupMinutes" type="number" min="0" defaultValue={variant?.cleanup_minutes ?? ""} /></label>
      </div>
      <div className="form-grid form-grid--three">
        <label>Travel buffer<input className="field-control" name="travelBufferMinutes" type="number" min="0" defaultValue={variant?.travel_buffer_minutes ?? ""} /></label>
        <label>Min guests<input className="field-control" name="minimumGuestCount" type="number" min="0" defaultValue={variant?.minimum_guest_count ?? ""} /></label>
        <label>Max guests<input className="field-control" name="maximumGuestCount" type="number" min="0" defaultValue={variant?.maximum_guest_count ?? ""} /></label>
      </div>
      <div className="form-grid form-grid--three">
        <label>Min notice<input className="field-control" name="minimumNoticeHours" type="number" min="0" defaultValue={variant?.minimum_notice_hours ?? ""} /></label>
        <label>Max advance<input className="field-control" name="maximumAdvanceDays" type="number" min="0" defaultValue={variant?.maximum_advance_days ?? ""} /></label>
        <label>Sort order<input className="field-control" name="variantSortOrder" type="number" min="0" defaultValue={variant?.sort_order ?? 0} /></label>
      </div>
      <div className="form-grid form-grid--three">
        <label>Price cents<input className="field-control" name="priceAmount" type="number" min="0" defaultValue={variant?.price_amount ?? ""} /></label>
        <label>Deposit cents<input className="field-control" name="depositAmount" type="number" min="0" defaultValue={variant?.deposit_amount ?? ""} /></label>
        <label>Deposit %<input className="field-control" name="depositPercentage" type="number" min="0" max="100" step="0.01" defaultValue={variant?.deposit_percentage ?? ""} /></label>
      </div>
      <label><input type="checkbox" name="variantActive" defaultChecked={variant?.active ?? true} /> Active</label>
      <Button type="submit" variant="secondary">{variant ? "Save variant" : "Add variant"}</Button>
    </form>
  );
}
