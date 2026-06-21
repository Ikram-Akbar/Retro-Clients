import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { Upload, CarFront, ArrowLeft, Trash2, Loader2 } from 'lucide-react';
import { createVehicle, getVehicle, updateVehicle, uploadVehicleImages, deleteVehicleImages, replaceVehicleImage } from '../../../services/vehiclesService';
import { unwrapPayload } from '../../../api/tokenUtils';
import useToast from '../../../hooks/useToast';

const VEHICLE_TYPES = ['Sedan', 'SUV', 'Sport', 'Exotic', 'Truck', 'Hatchback', 'Convertible', 'Van'];

const OwnerAddListing = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    model: '',
    vehicleType: 'Sedan',
    year: new Date().getFullYear(),
    registrationNumber: '',
    pricePerDay: '',
    securityDeposit: '',
    location: '',
    description: '',
  });

  // Fetch listing details if in edit mode
  useEffect(() => {
    if (!editId) return;

    const fetchVehicleDetails = async () => {
      try {
        setFetching(true);
        setError(null);
        const res = await getVehicle(editId);
        const car = unwrapPayload(res.data);
        if (car) {
          setFormData({
            title: car.title || '',
            brand: car.brand || '',
            model: car.model || '',
            vehicleType: car.vehicleType || 'Sedan',
            year: car.year || new Date().getFullYear(),
            registrationNumber: car.registrationNumber || '',
            pricePerDay: car.pricePerDay || '',
            securityDeposit: car.securityDeposit || '',
            location: car.location || '',
            description: car.description || '',
          });
          setExistingImages(car.images || []);
        }
      } catch (err) {
        setError('Failed to fetch vehicle details.');
        toast.error('Failed to load listing information.');
        console.error('Fetch vehicle error:', err);
      } finally {
        setFetching(false);
      }
    };

    fetchVehicleDetails();
  }, [editId, toast]);

  const handleFileChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const handleRemoveSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingImage = async (publicId) => {
    if (!editId) return;
    try {
      setLoading(true);
      await deleteVehicleImages(editId, { publicId });
      setExistingImages((prev) => prev.filter((img) => img.publicId !== publicId));
      toast.success('Image deleted successfully.');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete image.');
      console.error('Delete image error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReplaceImage = async (publicId, e) => {
    const file = e.target.files[0];
    if (!file || !editId) return;
    try {
      setLoading(true);
      const imageFormData = new FormData();
      imageFormData.append('publicId', publicId);
      imageFormData.append('image', file);
      const res = await replaceVehicleImage(editId, imageFormData);
      const updatedCar = unwrapPayload(res.data);
      if (updatedCar && updatedCar.images) {
        setExistingImages(updatedCar.images);
      }
      toast.success('Image replaced successfully.');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to replace image.');
      console.error('Replace image error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    // Front-end validations
    if (formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      toast.warning('Please enter a valid year.');
      return;
    }
    if (Number(formData.pricePerDay) <= 0) {
      toast.warning('Price per day must be a positive number.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: formData.title.trim(),
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        vehicleType: formData.vehicleType,
        year: Number(formData.year),
        registrationNumber: formData.registrationNumber.trim(),
        pricePerDay: Number(formData.pricePerDay),
        securityDeposit: formData.securityDeposit ? Number(formData.securityDeposit) : 0,
        location: formData.location.trim(),
        description: formData.description.trim(),
      };

      let vehicleId = editId;

      if (editId) {
        await updateVehicle(editId, payload);
        toast.success('Listing updated successfully!');
      } else {
        const res = await createVehicle(payload);
        const createdCar = res.data;
        vehicleId = createdCar?._id;
        toast.success('Listing created successfully!');
      }

      // Upload files if selected
      if (selectedFiles.length > 0 && vehicleId) {
        toast.info('Uploading vehicle images...');
        const imageFormData = new FormData();
        selectedFiles.forEach((file) => {
          imageFormData.append('images', file);
        });
        await uploadVehicleImages(vehicleId, imageFormData);
        toast.success('Images uploaded successfully!');
      }

      navigate('/dashboard/owner/listings');
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to save listing';
      toast.error(msg);
      console.error('Listing submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-slate-500">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-violet-600 mx-auto" />
          <p className="mt-3 text-[10px] font-bold tracking-wider uppercase text-slate-400">Loading details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/dashboard/owner/listings')}
          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer"
          title="Back to listings"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{editId ? 'Edit Vehicle Listing' : 'Create New Listing'}</h2>
          <p className="text-sm text-slate-500 mt-1">
            {editId ? 'Modify listing details and images for this vehicle.' : 'Register a new vehicle to your rental fleet.'}
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            
            {/* Title */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Vehicle Title / Header</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition"
                placeholder="e.g. Elegant Model S Plaid with Autopilot"
                required
              />
            </div>

            {/* Brand */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Brand / Maker</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition"
                placeholder="e.g. Tesla"
                required
              />
            </div>

            {/* Model */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Model</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition"
                placeholder="e.g. Model S Plaid"
                required
              />
            </div>

            {/* Vehicle Type */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Vehicle Type</label>
              <select
                value={formData.vehicleType}
                onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition"
              >
                {VEHICLE_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Year */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Year of Manufacture</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition"
                placeholder="e.g. 2024"
                required
              />
            </div>

            {/* Registration Number */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Registration Number</label>
              <input
                type="text"
                value={formData.registrationNumber}
                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                disabled={!!editId}
                className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
                  editId 
                    ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed border-dashed'
                    : 'bg-white text-slate-800 border-slate-200 focus:border-violet-600 focus:ring-1 focus:ring-violet-600'
                }`}
                placeholder="e.g. Reg-X90234"
                required
              />
              {editId && <p className="text-[10px] text-slate-400 mt-1">Registration plate cannot be updated.</p>}
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Location / Base City</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition"
                placeholder="e.g. San Francisco, CA"
                required
              />
            </div>

            {/* Price Per Day */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Price Per Day (BDT)</label>
              <input
                type="number"
                value={formData.pricePerDay}
                onChange={(e) => setFormData({ ...formData, pricePerDay: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition"
                placeholder="e.g. 120"
                required
              />
            </div>

            {/* Security Deposit */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Security Deposit (BDT, Optional)</label>
              <input
                type="number"
                value={formData.securityDeposit}
                onChange={(e) => setFormData({ ...formData, securityDeposit: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition"
                placeholder="e.g. 200"
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition resize-none"
                placeholder="Describe your vehicle's features, conditions, and custom details..."
                required
              />
            </div>

            {/* Images section */}
            <div className="sm:col-span-2 space-y-4">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Vehicle Images</label>
              
              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 border border-slate-100 rounded-2xl bg-slate-50/50">
                  {existingImages.map((img) => (
                    <div key={img.publicId} className="group relative h-28 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
                      <img src={img.url} alt="Vehicle thumbnail" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-200 text-white">
                        <label className="p-1.5 rounded-lg bg-white/20 hover:bg-white/40 text-white cursor-pointer transition" title="Replace image">
                          <Upload size={16} />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleReplaceImage(img.publicId, e)}
                          />
                        </label>
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => handleDeleteExistingImage(img.publicId)}
                          className="p-1.5 rounded-lg bg-white/20 hover:bg-rose-600 hover:text-white text-white cursor-pointer transition"
                          title="Delete image"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Selector */}
              <div className="relative">
                <input
                  type="file"
                  id="image-files"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="image-files"
                  className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-8 bg-slate-50/50 text-center hover:border-slate-300 transition cursor-pointer"
                >
                  <Upload size={32} className="text-slate-400 mb-3" />
                  <span className="text-sm font-semibold text-slate-700">Click to upload new images</span>
                  <span className="text-xs text-slate-400 mt-1">JPEG, PNG, WebP up to 10MB</span>
                </label>
              </div>

              {/* Selected Files Preview */}
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Selected Images ({selectedFiles.length})</h4>
                  <ul className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white text-xs text-slate-600">
                    {selectedFiles.map((file, idx) => (
                      <li key={idx} className="flex justify-between items-center px-4 py-3">
                        <span className="truncate max-w-[250px] font-medium text-slate-800">{file.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSelectedFile(idx)}
                            className="text-rose-500 hover:text-rose-700 transition cursor-pointer font-semibold"
                          >
                            Remove
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Submit Action */}
          <div className="border-t border-slate-100 pt-6 flex justify-end">
            <button
              type="submit"
              disabled={submitting || loading}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700 transition cursor-pointer shadow-xs disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CarFront size={16} />
              )}
              {submitting ? 'Saving listing...' : editId ? 'Save Changes' : 'Register Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OwnerAddListing;
