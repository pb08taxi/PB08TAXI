import React, { useState, useEffect } from 'react';
import { 
  Car, 
  Search, 
  Plus, 
  Phone, 
  MessageCircle, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  X, 
  AlertTriangle, 
  ShieldCheck, 
  Check,
  ChevronDown,
  ListFilter
} from 'lucide-react';
import { 
  getDrivers, 
  createDriver, 
  updateDriver, 
  deleteDriver, 
  toggleDriverActive,
  getFleetCars,
  createFleetCar,
  updateFleetCar,
  deleteFleetCar
} from '../api/client';
import { useAdminQuery, adminCache } from '../utils/adminCache';
import { useToast } from '../context/ToastContext';
import { useOpenWAChat } from '../context/ChatContext';
import { formatISTDate } from '../utils/dateTime';

const DEFAULT_PRESET_CARS = [
  { id: 'c1', name: 'Swift Dzire', category: 'Sedan', seating_capacity: '4+1 Seater', is_active: true },
  { id: 'c2', name: 'Toyota Innova Crysta', category: 'SUV', seating_capacity: '6+1 Seater', is_active: true },
  { id: 'c3', name: 'Maruti Ertiga', category: 'SUV', seating_capacity: '6+1 Seater', is_active: true },
  { id: 'c4', name: 'Hyundai Aura', category: 'Sedan', seating_capacity: '4+1 Seater', is_active: true },
  { id: 'c5', name: 'Honda City', category: 'Sedan', seating_capacity: '4+1 Seater', is_active: true },
  { id: 'c6', name: 'Mahindra Scorpio', category: 'SUV', seating_capacity: '7+1 Seater', is_active: true },
  { id: 'c7', name: 'Toyota Fortuner', category: 'Luxury', seating_capacity: '6+1 Seater', is_active: true },
  { id: 'c8', name: 'Tempo Traveller', category: 'Tempo Traveller', seating_capacity: '12+1 Seater', is_active: true },
];

export default function AdminDriversPage() {
  const { showSuccess, showError } = useToast();
  const { openChat } = useOpenWAChat();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    taxi_registration: '',
    car_name: '',
    is_active: true
  });
  const [phone10, setPhone10] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete Confirmation Modal
  const [deletingDriver, setDeletingDriver] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Fleet Cars Management States
  const [carsList, setCarsList] = useState(DEFAULT_PRESET_CARS);
  const [loadingCars, setLoadingCars] = useState(false);
  const [isCarsModalOpen, setIsCarsModalOpen] = useState(false);
  const [carSearchTerm, setCarSearchTerm] = useState('');
  const [isCarDropdownOpen, setIsCarDropdownOpen] = useState(false);
  const [carModalSearch, setCarModalSearch] = useState('');
  const [editingCar, setEditingCar] = useState(null);
  const [carForm, setCarForm] = useState({
    name: '',
    category: 'Sedan',
    seating_capacity: '4+1 Seater'
  });
  const [carFormSubmitting, setCarFormSubmitting] = useState(false);
  const [carFormError, setCarFormError] = useState('');
  const [deletingCar, setDeletingCar] = useState(null);
  const [deleteCarSubmitting, setDeleteCarSubmitting] = useState(false);

  // Fetch cars list
  const fetchCars = async () => {
    try {
      setLoadingCars(true);
      const data = await getFleetCars();
      if (Array.isArray(data) && data.length > 0) {
        setCarsList(data);
      } else {
        setCarsList(DEFAULT_PRESET_CARS);
      }
    } catch (err) {
      console.warn("Could not fetch fleet cars, using catalog presets:", err);
      setCarsList((prev) => (prev && prev.length > 0 ? prev : DEFAULT_PRESET_CARS));
    } finally {
      setLoadingCars(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const queryKey = `admin_drivers_${statusFilter}`;
  const { data, loading, isRevalidating, refresh, mutate } = useAdminQuery(
    queryKey,
    () => getDrivers(statusFilter),
    { ttl: 2 * 60 * 1000 }
  );

  const driversList = data || [];

  // Filter in memory for instantaneous search experience (Search by Driver, Taxi Plate, Phone, or Car Name)
  const filteredDrivers = driversList.filter((d) => {
    if (!debouncedSearch.trim()) return true;
    const q = debouncedSearch.toLowerCase().trim();
    return (
      (d.name && d.name.toLowerCase().includes(q)) ||
      (d.taxi_registration && d.taxi_registration.toLowerCase().includes(q)) ||
      (d.contact_number && d.contact_number.includes(q)) ||
      (d.car_name && d.car_name.toLowerCase().includes(q))
    );
  });

  const totalDrivers = driversList.length;
  const activeDrivers = driversList.filter(d => d.is_active).length;
  const totalRidesAssigned = driversList.reduce((acc, d) => acc + (d.total_rides || 0), 0);

  const handleOpenAddModal = () => {
    setEditingDriver(null);
    setFormData({
      name: '',
      taxi_registration: '',
      car_name: '',
      is_active: true
    });
    setPhone10('');
    setFormError('');
    setIsCarDropdownOpen(false);
    setCarSearchTerm('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (driver) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name || '',
      taxi_registration: driver.taxi_registration || '',
      car_name: driver.car_name || '',
      is_active: driver.is_active ?? true
    });
    const digits = (driver.contact_number || '').replace(/^\+91/, '').replace(/\D/g, '').slice(-10);
    setPhone10(digits);
    setFormError('');
    setIsCarDropdownOpen(false);
    setCarSearchTerm('');
    setIsModalOpen(true);
  };

  // Fleet Car CRUD Handlers
  const handleOpenAddCar = () => {
    setEditingCar(null);
    setCarForm({ name: '', category: 'Sedan', seating_capacity: '4+1 Seater' });
    setCarFormError('');
  };

  const handleEditCar = (car) => {
    setEditingCar(car);
    setCarForm({
      name: car.name,
      category: car.category || 'Sedan',
      seating_capacity: car.seating_capacity || '4+1 Seater'
    });
    setCarFormError('');
  };

  const handleSaveCar = async (e) => {
    e.preventDefault();
    setCarFormError('');
    if (!carForm.name.trim()) {
      setCarFormError('Car name is required (e.g., Toyota Innova Crysta).');
      return;
    }

    try {
      setCarFormSubmitting(true);
      if (editingCar) {
        const updated = await updateFleetCar(editingCar.id, carForm);
        setCarsList((prev) => prev.map((c) => (c.id === editingCar.id ? updated : c)));
        showSuccess(`Car model "${updated.name}" updated successfully!`, 'Car Updated');
      } else {
        const created = await createFleetCar(carForm);
        setCarsList((prev) => [...prev, created]);
        showSuccess(`New car model "${created.name}" added to fleet!`, 'Car Added');
      }
      handleOpenAddCar();
    } catch (err) {
      const is405 = err.response?.status === 405 || (typeof err.response?.data?.detail === 'string' && err.response.data.detail.toLowerCase().includes('method not allowed'));
      const msg = is405 
        ? 'Render API sync in progress. Please click "Manual Deploy > Deploy latest commit" on your Render dashboard and refresh in 2 minutes.'
        : (err.response?.data?.detail || 'Failed to save car model.');
      setCarFormError(msg);
      showError(msg, 'Save Error');
    } finally {
      setCarFormSubmitting(false);
    }
  };

  const handleDeleteCar = async () => {
    if (!deletingCar) return;
    try {
      setDeleteCarSubmitting(true);
      await deleteFleetCar(deletingCar.id);
      setCarsList((prev) => prev.filter((c) => c.id !== deletingCar.id));
      showSuccess(`Car model "${deletingCar.name}" removed from fleet catalog.`, 'Car Removed');
      setDeletingCar(null);
      refresh();
    } catch (err) {
      const is405 = err.response?.status === 405;
      const msg = is405
        ? 'Render API sync in progress. Please deploy latest commit on Render.'
        : (err.response?.data?.detail || 'Failed to remove car model.');
      showError(msg, 'Delete Error');
    } finally {
      setDeleteCarSubmitting(false);
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Driver name is required.');
      return;
    }
    if (!formData.taxi_registration.trim()) {
      setFormError('Taxi registration number is required (e.g., PB01CC1372).');
      return;
    }
    const cleanDigits = phone10.replace(/\D/g, '');
    if (cleanDigits.length !== 10) {
      setFormError('Please enter a valid 10-digit mobile number for driver (e.g., 98765 43210).');
      return;
    }

    try {
      setFormSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        taxi_registration: formData.taxi_registration.trim().toUpperCase(),
        contact_number: `+91${cleanDigits}`,
        car_name: formData.car_name ? formData.car_name.trim() : null,
        is_active: Boolean(formData.is_active)
      };

      if (editingDriver) {
        const updated = await updateDriver(editingDriver.id, payload);
        mutate((prev) =>
          prev ? prev.map((d) => (d.id === editingDriver.id ? { ...d, ...updated } : d)) : []
        );
      } else {
        const created = await createDriver(payload);
        mutate((prev) => (prev ? [created, ...prev] : [created]));
      }

      adminCache.invalidate('admin_drivers');
      setIsModalOpen(false);
      showSuccess(
        editingDriver ? `Driver ${payload.name} updated successfully!` : `New driver ${payload.name} added to fleet!`,
        'Driver Saved'
      );
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to save driver details. Please verify the phone number.';
      setFormError(msg);
      showError(msg, 'Save Error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleActive = async (driver) => {
    try {
      const res = await toggleDriverActive(driver.id);
      mutate((prev) =>
        prev ? prev.map((d) => (d.id === driver.id ? { ...d, is_active: res.is_active } : d)) : []
      );
      adminCache.invalidate('admin_drivers');
      showSuccess(
        `Driver ${driver.name} is now ${res.is_active ? 'Active & Ready for Dispatches' : 'Inactive'}.`,
        'Driver Status'
      );
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to toggle driver status.', 'Status Error');
    }
  };

  const handleDeleteDriver = async () => {
    if (!deletingDriver) return;
    try {
      setDeleteSubmitting(true);
      await deleteDriver(deletingDriver.id);
      mutate((prev) => (prev ? prev.filter((d) => d.id !== deletingDriver.id) : []));
      adminCache.invalidate('admin_drivers');
      const driverName = deletingDriver.name;
      setDeletingDriver(null);
      showSuccess(`Driver ${driverName} deleted successfully!`, 'Driver Removed');
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to delete driver.', 'Delete Failed');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-taxi-yellow/10 border border-taxi-yellow/20 rounded-xl text-taxi-yellow">
              <Car className="w-5 h-5" />
            </span>
            <h1 className="text-3xl font-black text-white">Driver Management</h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Manage PB08 TAXI fleet drivers, assign duties on booking confirmation, and track rides.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <button
            onClick={() => refresh()}
            disabled={loading || isRevalidating}
            className="inline-flex items-center space-x-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 px-3.5 py-2 rounded-xl text-xs font-bold border border-zinc-800 transition-colors"
            title="Refresh driver records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading || isRevalidating ? 'animate-spin' : ''}`} />
            <span>{isRevalidating ? 'Updating...' : 'Refresh'}</span>
          </button>

          <button
            onClick={() => {
              handleOpenAddCar();
              setIsCarsModalOpen(true);
            }}
            className="inline-flex items-center space-x-2 bg-zinc-900 hover:bg-zinc-800 text-taxi-yellow px-3.5 py-2 rounded-xl text-xs font-bold border border-taxi-yellow/30 hover:border-taxi-yellow transition-colors shadow-sm"
            title="Manage Fleet Car Models catalog"
          >
            <Car className="w-4 h-4 text-taxi-yellow" />
            <span>Manage Car List ({carsList.length})</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center space-x-2 bg-taxi-yellow hover:bg-yellow-400 text-black px-4 py-2 rounded-xl text-xs font-extrabold shadow-lg shadow-taxi-yellow/10 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Driver</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-950 border border-zinc-850 p-4 sm:p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Fleet Drivers</span>
            <Car className="w-4 h-4 text-taxi-yellow" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{totalDrivers}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Verified drivers in database</div>
        </div>

        <div className="bg-zinc-950 border border-zinc-850 p-4 sm:p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Active on Duty</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{activeDrivers}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Ready for ride assignments</div>
        </div>

        <div className="bg-zinc-950 border border-zinc-850 p-4 sm:p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-taxi-yellow uppercase tracking-wider">Fleet Car Models</span>
            <Car className="w-4 h-4 text-taxi-yellow" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{carsList.length}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Vehicle models in catalog</div>
        </div>

        <div className="bg-zinc-950 border border-zinc-850 p-4 sm:p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-taxi-yellow uppercase tracking-wider">Total Completed Rides</span>
            <ShieldCheck className="w-4 h-4 text-taxi-yellow" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{totalRidesAssigned}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Bookings fulfilled across fleet</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="bg-zinc-950 border border-zinc-850 rounded-2xl px-4 py-2.5 flex items-center space-x-3 flex-1">
          <Search className="w-4 h-4 text-zinc-500 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search driver by name, plate number (e.g., PB01CC1372), or phone..."
            className="w-full bg-transparent border-none text-xs sm:text-sm text-white placeholder-zinc-500 outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-zinc-500 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Status Pill Filters */}
        <div className="flex items-center bg-zinc-950 border border-zinc-850 p-1 rounded-2xl self-start sm:self-auto space-x-1">
          {['ALL', 'ACTIVE', 'INACTIVE'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-colors ${
                statusFilter === st
                  ? 'bg-taxi-yellow text-black shadow'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Driver List Table */}
      <div className="bg-zinc-950 border border-zinc-850 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 sm:p-6 border-b border-zinc-850 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Car className="w-5 h-5 text-taxi-yellow" />
            <h2 className="text-base font-bold text-white">
              Fleet Drivers ({filteredDrivers.length})
            </h2>
          </div>
          <span className="text-xs text-zinc-500">
            {activeDrivers} active out of {totalDrivers} drivers
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase tracking-wider text-zinc-500 bg-zinc-900/40 border-b border-zinc-850">
              <tr>
                <th className="py-3.5 px-6">Driver Details</th>
                <th className="py-3.5 px-6">Vehicle / Car</th>
                <th className="py-3.5 px-6">Taxi Reg. Number</th>
                <th className="py-3.5 px-6">Contact Number</th>
                <th className="py-3.5 px-6 text-center">Status</th>
                <th className="py-3.5 px-6 text-center">Assigned Rides</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 text-zinc-300">
              {loading && driversList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-taxi-yellow" />
                      <span>Loading driver fleet records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Car className="w-8 h-8 text-zinc-700" />
                      <p className="text-sm font-semibold text-zinc-400">No fleet drivers found</p>
                      <p className="text-xs text-zinc-600">Click "Add New Driver" to register a driver with taxi registration number.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDrivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-zinc-900/40 transition-colors">
                    {/* Driver Name & Initials */}
                    <td className="py-4 px-6 font-bold text-white text-sm">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-taxi-yellow/20 to-amber-600/20 border border-taxi-yellow/30 flex items-center justify-center text-taxi-yellow font-black text-xs uppercase flex-shrink-0">
                          {driver.name ? driver.name.substring(0, 2) : 'DR'}
                        </div>
                        <div>
                          <div className="text-white font-extrabold">{driver.name}</div>
                          <div className="text-[10px] text-zinc-500 font-normal">
                            Added: {formatISTDate(driver.created_at)}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Vehicle / Car Model */}
                    <td className="py-4 px-6">
                      {driver.car_name ? (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-taxi-yellow/10 text-taxi-yellow font-bold text-xs border border-taxi-yellow/20">
                          <Car className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate max-w-[130px]">{driver.car_name}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-500 italic">No Car Assigned</span>
                      )}
                    </td>

                    {/* Taxi Plate Reg Badge */}
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-zinc-900 text-amber-300 font-mono font-bold tracking-wider text-xs border border-amber-400/30 shadow-inner">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                        {driver.taxi_registration}
                      </span>
                    </td>

                    {/* Contact Number with OpenWA Direct Chat */}
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-zinc-300 font-medium">{driver.contact_number}</span>
                        <button
                          type="button"
                          onClick={() => openChat({
                            name: driver.name,
                            role: 'Driver',
                            phone: driver.contact_number,
                            taxiReg: driver.taxi_registration,
                            carName: driver.car_name
                          })}
                          className="p-1 rounded bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors cursor-pointer"
                          title={`Chat with Driver ${driver.name} via OpenWA`}
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Active/Inactive Toggle */}
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleToggleActive(driver)}
                        className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold transition-all ${
                          driver.is_active
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900'
                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700'
                        }`}
                        title="Click to toggle active status"
                      >
                        {driver.is_active ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>ACTIVE</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-zinc-500" />
                            <span>OFF DUTY</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Total Rides */}
                    <td className="py-4 px-6 text-center">
                      <span className="bg-zinc-900 text-taxi-yellow px-3 py-1 rounded-full border border-zinc-800 font-bold">
                        {driver.total_rides || 0} rides
                      </span>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(driver)}
                          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
                          title="Edit driver"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingDriver(driver)}
                          className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-900/40 transition-colors"
                          title="Delete driver"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Driver Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-up">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-zinc-850 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <span className="p-2 bg-taxi-yellow/10 border border-taxi-yellow/20 rounded-xl text-taxi-yellow">
                  <Car className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    {editingDriver ? 'Edit Driver Details' : 'Add New Fleet Driver'}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {editingDriver ? 'Update driver contact and vehicle info' : 'Register taxi registration and driver phone number'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} className="p-5 sm:p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-300 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-400" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Driver Name */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Driver Name <span className="text-taxi-yellow">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Gurpreet Singh"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-taxi-yellow transition-colors"
                />
              </div>

              {/* Taxi Registration Number */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Taxi Registration Number <span className="text-taxi-yellow">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.taxi_registration}
                    onChange={(e) => setFormData({ ...formData, taxi_registration: e.target.value.toUpperCase() })}
                    placeholder="e.g. PB01CC1372"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 uppercase font-mono tracking-wider focus:outline-none focus:border-taxi-yellow transition-colors"
                  />
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Format: PB01CC1372 (Official vehicle number plate displayed to customers upon confirmation)
                </p>
              </div>

              {/* Select Car (Vehicle Model) with Instant Search */}
              <div className="relative">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-zinc-300">
                    Assigned Car Model <span className="text-zinc-500 font-normal">(Search & Select)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      handleOpenAddCar();
                      setIsCarsModalOpen(true);
                    }}
                    className="text-[11px] text-taxi-yellow hover:underline font-bold flex items-center space-x-1"
                  >
                    <span>+ Manage Car List</span>
                  </button>
                </div>

                {/* Car Selector Trigger */}
                <div 
                  onClick={() => setIsCarDropdownOpen(!isCarDropdownOpen)}
                  className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-2 truncate">
                    <Car className="w-4 h-4 text-taxi-yellow flex-shrink-0" />
                    {formData.car_name ? (
                      <span className="font-bold text-white truncate">{formData.car_name}</span>
                    ) : (
                      <span className="text-zinc-500">Select or search car model (e.g. Dzire, Innova)...</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1.5 flex-shrink-0">
                    {formData.car_name && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData({ ...formData, car_name: '' });
                        }}
                        className="text-zinc-500 hover:text-white p-1 rounded hover:bg-zinc-800 transition-colors"
                        title="Clear car selection"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isCarDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {/* Searchable Dropdown Popup */}
                {isCarDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-2.5 max-h-64 overflow-hidden flex flex-col animate-scale-up">
                    <div className="relative mb-2">
                      <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={carSearchTerm}
                        onChange={(e) => setCarSearchTerm(e.target.value)}
                        placeholder="Search car by name (e.g. Swift, Ertiga, Scorpio)..."
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-taxi-yellow"
                      />
                    </div>

                    <div className="overflow-y-auto space-y-1 flex-1 pr-1 max-h-48">
                      {carsList
                        .filter((c) => 
                          !carSearchTerm || 
                          c.name.toLowerCase().includes(carSearchTerm.toLowerCase()) || 
                          (c.category && c.category.toLowerCase().includes(carSearchTerm.toLowerCase()))
                        )
                        .map((car) => {
                          const isSelected = formData.car_name === car.name;
                          return (
                            <div
                              key={car.id}
                              onClick={() => {
                                setFormData({ ...formData, car_name: car.name });
                                setIsCarDropdownOpen(false);
                                setCarSearchTerm('');
                              }}
                              className={`p-2 rounded-xl cursor-pointer flex items-center justify-between text-xs transition-colors ${
                                isSelected
                                  ? 'bg-taxi-yellow/15 text-taxi-yellow font-bold border border-taxi-yellow/30'
                                  : 'hover:bg-zinc-800/80 text-zinc-200'
                              }`}
                            >
                              <div className="flex items-center space-x-2 truncate">
                                <Car className={`w-3.5 h-3.5 ${isSelected ? 'text-taxi-yellow' : 'text-zinc-500'}`} />
                                <span className="truncate">{car.name}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-[10px] text-zinc-500 flex-shrink-0">
                                <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">{car.category || 'Sedan'}</span>
                                {car.seating_capacity && (
                                  <span className="hidden sm:inline">{car.seating_capacity}</span>
                                )}
                                {isSelected && <Check className="w-3.5 h-3.5 text-taxi-yellow" />}
                              </div>
                            </div>
                          );
                        })}

                      {carsList.filter((c) => 
                        !carSearchTerm || 
                        c.name.toLowerCase().includes(carSearchTerm.toLowerCase())
                      ).length === 0 && (
                        <div className="py-4 text-center text-xs text-zinc-500">
                          <p>No car matches "{carSearchTerm}".</p>
                          <button
                            type="button"
                            onClick={() => {
                              setIsCarDropdownOpen(false);
                              handleOpenAddCar();
                              setCarForm({ name: carSearchTerm, category: 'Sedan', seating_capacity: '4+1 Seater' });
                              setIsCarsModalOpen(true);
                            }}
                            className="mt-1.5 text-taxi-yellow hover:underline font-bold text-xs"
                          >
                            + Add "{carSearchTerm}" to Car List
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <p className="text-[11px] text-zinc-500 mt-1">
                  Customer will see this car model in confirmation WhatsApp messages when this driver is assigned.
                </p>
              </div>

              {/* Driver Contact with separated +91 badge & 10-digit lock */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1 flex items-center justify-between">
                  <span>
                    Driver Contact / WhatsApp Number <span className="text-taxi-yellow">*</span>
                  </span>
                  <span className={`text-[11px] font-mono ${phone10.length === 10 ? 'text-emerald-400 font-bold' : 'text-zinc-500'}`}>
                    {phone10.length}/10 digits
                  </span>
                </label>
                <div className="flex rounded-xl overflow-hidden border border-zinc-800 focus-within:border-taxi-yellow transition-all">
                  <div className="bg-zinc-800/90 px-3.5 py-2.5 text-xs font-bold text-taxi-yellow border-r border-zinc-700 select-none flex items-center space-x-1.5 flex-shrink-0">
                    <span className="text-sm leading-none">🇮🇳</span>
                    <span className="font-mono font-black tracking-wider">+91</span>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    required
                    value={phone10}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setPhone10(digits);
                      setFormError('');
                    }}
                    placeholder="98765 43210"
                    className="w-full bg-zinc-900 py-2.5 px-3.5 text-xs sm:text-sm text-white placeholder-zinc-500 font-mono tracking-wider outline-none"
                  />
                  {phone10.length === 10 && (
                    <div className="pr-3 flex items-center bg-zinc-900 text-emerald-400 flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                </div>
                {phone10.length === 10 ? (
                  <p className="text-[11px] text-emerald-400 mt-1 font-mono">
                    ✓ Dispatch duty alerts will be sent to: <strong>+91{phone10}</strong>
                  </p>
                ) : (
                  <p className="text-[11px] text-zinc-500 mt-1">
                    WhatsApp booking duty alerts with customer pickup details will be sent to this 10-digit number.
                  </p>
                )}
              </div>

              {/* Active Toggle Checkbox */}
              <div className="pt-2">
                <label className="flex items-center space-x-3 cursor-pointer select-none bg-zinc-900/60 border border-zinc-850 p-3 rounded-xl hover:bg-zinc-900 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 rounded border-zinc-700 text-taxi-yellow focus:ring-taxi-yellow focus:ring-offset-zinc-950 accent-taxi-yellow cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">Active on Duty</span>
                    <span className="text-[11px] text-zinc-400 block">
                      Driver will appear in the driver assignment list when confirming bookings.
                    </span>
                  </div>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-zinc-850">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={formSubmitting}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-taxi-yellow hover:bg-yellow-400 text-black shadow-lg shadow-taxi-yellow/10 transition-colors flex items-center space-x-2"
                >
                  {formSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingDriver ? 'Save Changes' : 'Register Driver'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Driver Confirmation Modal */}
      {deletingDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-950 border border-red-900/40 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 text-center space-y-4 animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-red-950/60 border border-red-800/80 text-red-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-black text-white">Delete Driver?</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Are you sure you want to remove <span className="text-white font-bold">{deletingDriver.name}</span> ({deletingDriver.taxi_registration})?
                Existing ride history will be preserved.
              </p>
            </div>

            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingDriver(null)}
                disabled={deleteSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteDriver}
                disabled={deleteSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-extrabold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20 transition-colors flex items-center space-x-2"
              >
                {deleteSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Driver</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fleet Cars Management Modal */}
      {isCarsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-auto animate-scale-up">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-zinc-850 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="p-2.5 bg-taxi-yellow/10 border border-taxi-yellow/20 rounded-xl text-taxi-yellow">
                  <Car className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-lg font-black text-white">Fleet Cars Catalog (Car List)</h3>
                  <p className="text-xs text-zinc-400">
                    Add, edit, or remove vehicle models available for drivers and booking dispatch
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsCarsModalOpen(false);
                  setEditingCar(null);
                }}
                className="text-zinc-500 hover:text-white p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Form to Add / Edit Car Model */}
              <div className="bg-zinc-900/60 border border-zinc-850 p-4 sm:p-5 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs sm:text-sm font-extrabold text-white flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-taxi-yellow inline-block" />
                    <span>{editingCar ? `Edit Car: ${editingCar.name}` : 'Add New Car Model to Fleet'}</span>
                  </h4>
                  {editingCar && (
                    <button
                      type="button"
                      onClick={handleOpenAddCar}
                      className="text-xs text-zinc-400 hover:text-white underline font-semibold"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                {carFormError && (
                  <div className="mb-3 p-2.5 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-300 flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-400" />
                    <span>{carFormError}</span>
                  </div>
                )}

                <form onSubmit={handleSaveCar} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Car Model Name */}
                    <div className="sm:col-span-1">
                      <label className="block text-[11px] font-bold text-zinc-300 mb-1">
                        Car Model Name <span className="text-taxi-yellow">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={carForm.name}
                        onChange={(e) => setCarForm({ ...carForm, name: e.target.value })}
                        placeholder="e.g. Dzire / Innova Crysta"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-taxi-yellow"
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-300 mb-1">
                        Vehicle Category
                      </label>
                      <select
                        value={carForm.category}
                        onChange={(e) => setCarForm({ ...carForm, category: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-taxi-yellow"
                      >
                        <option value="Sedan">Sedan</option>
                        <option value="SUV">SUV</option>
                        <option value="Hatchback">Hatchback</option>
                        <option value="Luxury">Luxury</option>
                        <option value="Tempo Traveller">Tempo Traveller</option>
                        <option value="Mini Bus">Mini Bus</option>
                      </select>
                    </div>

                    {/* Seating Capacity */}
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-300 mb-1">
                        Seating Capacity
                      </label>
                      <select
                        value={carForm.seating_capacity}
                        onChange={(e) => setCarForm({ ...carForm, seating_capacity: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-taxi-yellow"
                      >
                        <option value="4+1 Seater">4+1 Seater</option>
                        <option value="6+1 Seater">6+1 Seater</option>
                        <option value="7+1 Seater">7+1 Seater</option>
                        <option value="8+1 Seater">8+1 Seater</option>
                        <option value="12+1 Seater">12+1 Seater</option>
                        <option value="17+1 Seater">17+1 Seater</option>
                        <option value="26+1 Seater">26+1 Seater</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={carFormSubmitting}
                      className="px-4 py-2 bg-taxi-yellow hover:bg-yellow-400 text-black rounded-xl text-xs font-extrabold shadow-md flex items-center space-x-1.5 transition-colors"
                    >
                      {carFormSubmitting ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                      <span>{editingCar ? 'Update Car Model' : 'Add to Car List'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Existing Fleet Cars List */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-white flex items-center space-x-2">
                    <Car className="w-4 h-4 text-taxi-yellow" />
                    <span>Active Fleet Cars ({carsList.length})</span>
                  </h4>
                  {/* Search inside cars modal */}
                  <div className="relative w-full sm:w-60">
                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={carModalSearch}
                      onChange={(e) => setCarModalSearch(e.target.value)}
                      placeholder="Search car list by name..."
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-taxi-yellow"
                    />
                  </div>
                </div>

                <div className="divide-y divide-zinc-850 border border-zinc-850 rounded-2xl overflow-hidden bg-zinc-900/40">
                  {loadingCars ? (
                    <div className="py-8 text-center text-xs text-zinc-500 flex items-center justify-center space-x-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-taxi-yellow" />
                      <span>Loading fleet cars...</span>
                    </div>
                  ) : carsList.filter(
                      (c) =>
                        !carModalSearch ||
                        c.name.toLowerCase().includes(carModalSearch.toLowerCase()) ||
                        (c.category && c.category.toLowerCase().includes(carModalSearch.toLowerCase()))
                    ).length === 0 ? (
                    <div className="py-8 text-center text-xs text-zinc-500">
                      No car models found matching "{carModalSearch}".
                    </div>
                  ) : (
                    carsList
                      .filter(
                        (c) =>
                          !carModalSearch ||
                          c.name.toLowerCase().includes(carModalSearch.toLowerCase()) ||
                          (c.category && c.category.toLowerCase().includes(carModalSearch.toLowerCase()))
                      )
                      .map((car) => (
                        <div
                          key={car.id}
                          className="p-3.5 flex items-center justify-between hover:bg-zinc-900/80 transition-colors"
                        >
                          <div className="flex items-center space-x-3 truncate">
                            <div className="w-8 h-8 rounded-xl bg-taxi-yellow/10 border border-taxi-yellow/20 flex items-center justify-center text-taxi-yellow flex-shrink-0">
                              <Car className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-black text-white">{car.name}</div>
                              <div className="flex items-center space-x-2 text-[10px] text-zinc-400 mt-0.5">
                                <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300 font-medium">
                                  {car.category || 'Sedan'}
                                </span>
                                <span>•</span>
                                <span>{car.seating_capacity || '4+1 Seater'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => handleEditCar(car)}
                              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                              title="Edit car"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingCar(car)}
                              className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 transition-colors"
                              title="Remove car"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-zinc-850 flex items-center justify-end bg-zinc-950">
              <button
                type="button"
                onClick={() => {
                  setIsCarsModalOpen(false);
                  setEditingCar(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors"
              >
                Done / Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Car Model Confirmation Modal */}
      {deletingCar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-950 border border-red-900/40 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 text-center space-y-4 animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-red-950/60 border border-red-800/80 text-red-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-black text-white">Remove Car Model?</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Are you sure you want to remove <span className="text-white font-bold">{deletingCar.name}</span> from the fleet catalog? Drivers currently assigned this car will retain their vehicle name.
              </p>
            </div>

            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCar(null)}
                disabled={deleteCarSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCar}
                disabled={deleteCarSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-extrabold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20 transition-colors flex items-center space-x-2"
              >
                {deleteCarSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Remove Car</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
