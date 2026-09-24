import { styled } from "@mui/material/styles";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CircularProgress,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import BuildIcon from "@mui/icons-material/Build";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import HistoryIcon from "@mui/icons-material/History";
import FilterListIcon from "@mui/icons-material/FilterList";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AppsIcon from "@mui/icons-material/Apps";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import FusePageSimpleWithMargin from "@fuse/core/FusePageSimple/FusePageSimpleWithMargin";
import useThemeMediaQuery from "@fuse/hooks/useThemeMediaQuery";
import { useAppSelector } from "app/store/hooks";
import { selectUser } from "src/app/auth/user/store/userSlice";
import {
  useGetMyRegisteredMachines,
  useDeleteRegisteredMachine,
} from "app/configs/data/server-calls/engineering/useMyMachinesRepo";
import useGetMachineTypes from "app/configs/data/server-calls/engineering/useMachineTypesRepo";
import RegisterMachineDialog from "./RegisterMachineDialog";

const CATEGORIES = [
  { value: null, label: "All machines", icon: AppsIcon },
  { value: "AUTOMOBILE", label: "Automobile", icon: DirectionsCarIcon },
  { value: "GENERATOR", label: "Generator", icon: ElectricBoltIcon },
  { value: "DIESEL_HEAVY_EQUIPMENT", label: "Diesel & Heavy Equipment", icon: LocalShippingIcon },
];

const Root = styled(FusePageSimpleWithMargin)(({ theme }) => ({
  "& .FusePageSimple-header": {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: "solid",
    borderColor: theme.palette.divider,
  },
}));

function MachineCard({ machine, onEdit, onDelete }) {
  const dueSoon = machine.nextServiceDueDate && new Date(machine.nextServiceDueDate) < new Date(Date.now() + 14 * 86400000);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
            <DirectionsCarIcon sx={{ color: "#ea580c" }} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{machine.nickname || "Unnamed machine"}</h3>
            <p className="text-sm text-gray-500">
              {[machine.plateNumber, machine.serialNumber].filter(Boolean).join(" · ") || "No ID set"}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <IconButton size="small" onClick={() => onEdit(machine)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => onDelete(machine)}>
            <DeleteOutlineIcon fontSize="small" sx={{ color: "#dc2626" }} />
          </IconButton>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        {machine.mileage != null && (
          <Chip label={`${machine.mileage.toLocaleString()} km`} size="small" sx={{ backgroundColor: "#f9fafb" }} />
        )}
        {machine.engineHours != null && (
          <Chip label={`${machine.engineHours} eng. hrs`} size="small" sx={{ backgroundColor: "#f9fafb" }} />
        )}
      </div>

      {machine.nextServiceDueDate && (
        <div
          className={`mt-4 flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${
            dueSoon ? "bg-amber-50 text-amber-800" : "bg-orange-50 text-orange-800"
          }`}
        >
          <HistoryIcon sx={{ fontSize: "1rem" }} />
          Next service due {new Date(machine.nextServiceDueDate).toLocaleDateString()}
          {machine.nextServiceDueMileage ? ` or ${machine.nextServiceDueMileage.toLocaleString()} km` : ""}
        </div>
      )}
    </div>
  );
}

function MyMachinesHeader({ onRegister, onToggleFilters, onToggleReminders }) {
  return (
    <div
      className="w-full text-white py-10 px-6 sm:px-10"
      style={{ background: "linear-gradient(to bottom right, #ea580c, #9a3412)" }}
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          {onToggleFilters && (
            <IconButton onClick={onToggleFilters} aria-label="toggle filters" sx={{ color: "white", ml: -1.5 }}>
              <FuseSvgIcon>heroicons-outline:menu</FuseSvgIcon>
            </IconButton>
          )}
          <BuildIcon sx={{ fontSize: "1.75rem" }} />
          <div>
            <h1 className="text-2xl sm:text-3xl font-black">My Machines</h1>
            <p className="text-orange-100 text-sm mt-1">Vehicles, generators &amp; equipment you've registered</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onRegister}
            sx={{ backgroundColor: "white", color: "#ea580c", fontWeight: 700, "&:hover": { backgroundColor: "#fff7ed" } }}
          >
            Register a machine
          </Button>
          {onToggleReminders && (
            <IconButton onClick={onToggleReminders} aria-label="toggle reminders" sx={{ color: "white" }}>
              <NotificationsActiveOutlinedIcon />
            </IconButton>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * MyMachinesFilterSidebar — left column, same visual language as
 * ShopFinderPage's own filter sidebar: an orange-gradient-headed card with
 * a vertical list of options, this time filtering the customer's own
 * machines by their real MachineType category.
 */
function MyMachinesFilterSidebar({ selectedCategory, onSelectCategory }) {
  return (
    <div
      className="flex flex-col h-screen p-6"
      style={{ background: "linear-gradient(180deg, #f9fafb 0%, #f3f4f6 100%)" }}
    >
      <div
        className="rounded-2xl shadow-lg overflow-hidden"
        style={{ background: "linear-gradient(135deg, #ffffff 0%, #fff5f0 50%, #ffedd5 100%)" }}
      >
        <div
          className="flex items-center gap-3 p-4"
          style={{
            background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
            boxShadow: "0 4px 15px rgba(249, 115, 22, 0.3)",
          }}
        >
          <FilterListIcon sx={{ color: "white", fontSize: "1.75rem" }} />
          <Typography sx={{ fontWeight: 700, color: "white", fontSize: "1.25rem" }}>
            Filter Machines
          </Typography>
        </div>

        <div className="p-4 flex flex-col gap-2">
          <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", px: 1, pb: 0.5 }}>
            Type
          </Typography>
          {CATEGORIES.map((opt) => {
            const Icon = opt.icon;
            const active = selectedCategory === opt.value;
            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => onSelectCategory(opt.value)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left font-semibold text-sm transition-all"
                style={{
                  backgroundColor: active ? "#ea580c" : "white",
                  color: active ? "white" : "#374151",
                  border: active ? "1px solid #ea580c" : "1px solid #e5e7eb",
                }}
              >
                <Icon sx={{ fontSize: "1.1rem" }} />
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * MyMachinesRemindersSidebar — right column, same h-screen/gradient-header
 * shell as the map sidebars elsewhere in this vertical, holding real
 * upcoming-service data instead of a map (a machine has no location of its
 * own worth mapping) — every machine with a real nextServiceDueDate
 * (written server-side by Phase E4's completeBooking, never fabricated),
 * soonest first.
 */
function MyMachinesRemindersSidebar({ machines }) {
  const upcoming = useMemo(
    () =>
      machines
        .filter((m) => m.nextServiceDueDate)
        .sort((a, b) => new Date(a.nextServiceDueDate) - new Date(b.nextServiceDueDate)),
    [machines],
  );

  return (
    <div
      className="flex flex-col h-screen p-6"
      style={{ background: "linear-gradient(180deg, #fafaf9 0%, #f3f4f6 100%)" }}
    >
      <div
        className="mb-6 p-4 rounded-xl flex items-center gap-3"
        style={{
          background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
          boxShadow: "0 4px 15px rgba(234, 88, 12, 0.3)",
        }}
      >
        <NotificationsActiveOutlinedIcon sx={{ color: "white", fontSize: "1.75rem" }} />
        <Typography sx={{ fontSize: "1.25rem", fontWeight: 700, color: "white" }}>
          Service Reminders
        </Typography>
      </div>

      <div className="flex-1 rounded-2xl overflow-hidden shadow-2xl bg-white overflow-y-auto">
        {upcoming.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6">
            <EventAvailableIcon sx={{ fontSize: "3rem", color: "#fdba74" }} />
            <p className="font-bold text-gray-900 mt-3">No upcoming reminders</p>
            <p className="text-sm text-gray-500 mt-1">
              Once a shop completes a service and schedules your next visit, it'll show up here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {upcoming.map((m) => {
              const dueSoon = new Date(m.nextServiceDueDate) < new Date(Date.now() + 14 * 86400000);
              return (
                <div key={m.id} className="p-4">
                  <p className="font-bold text-gray-900 text-sm">{m.nickname || "Unnamed machine"}</p>
                  <div
                    className={`mt-2 flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold w-fit ${
                      dueSoon ? "bg-amber-50 text-amber-800" : "bg-orange-50 text-orange-800"
                    }`}
                  >
                    <HistoryIcon sx={{ fontSize: "0.9rem" }} />
                    Due {new Date(m.nextServiceDueDate).toLocaleDateString()}
                    {m.nextServiceDueMileage ? ` · ${m.nextServiceDueMileage.toLocaleString()} km` : ""}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-md">
        <Typography sx={{ fontSize: "0.875rem", color: "#6b7280", textAlign: "center" }}>
          We'll also email you before each one is due
        </Typography>
      </div>
    </div>
  );
}

/**
 * MyMachinesPage — "My Machines" hub (Phase E6c). Lists every machine the
 * customer has registered platform-wide (not scoped to one shop), lets them
 * register a new one, edit, or remove one. Booking a service happens from a
 * shop's own detail page (BookServiceDialog), which reads from the same
 * '__myMachines' query — this page is the management home, not the only
 * entry point. Redesigned 2026-09-24 onto the same FusePageSimpleWithMargin
 * 3-column shell as ShopFinderPage/Bookings, for layout consistency across
 * the whole Engineering vertical: a left filter sidebar (by machine type),
 * the machine-card grid as the center content, and a right sidebar
 * surfacing real upcoming service reminders (no map here — a machine has
 * no location of its own — but the same shell, not a one-off page).
 */
function MyMachinesPage() {
  const navigate = useNavigate();
  const currentUser = useAppSelector(selectUser);
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down("lg"));
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    if (!currentUser?.name) navigate("/sign-in");
  }, [currentUser?.name, navigate]);

  useEffect(() => {
    setLeftSidebarOpen(!isMobile);
    setRightSidebarOpen(!isMobile);
  }, [isMobile]);

  // Gated on being actually logged in, not just on the redirect-to-/sign-in
  // effect above: that effect only runs after the first render, so without
  // this the hook would still fire (and 401, then reload-loop — see
  // useMyMachinesRepo.js) for a guest who lands here directly, in the gap
  // before the redirect takes effect.
  const { data: machinesResp, isLoading, isError } = useGetMyRegisteredMachines(Boolean(currentUser?.name));
  const allMachines = machinesResp?.data ?? [];
  const { data: typesResp } = useGetMachineTypes();
  const machineTypes = typesResp?.data ?? [];
  const { mutate: deleteMachine, isLoading: deleting } = useDeleteRegisteredMachine();

  const categoryByTypeId = useMemo(() => {
    const map = {};
    machineTypes.forEach((t) => { map[t.id] = t.category; });
    return map;
  }, [machineTypes]);

  const machines = useMemo(() => {
    if (!selectedCategory) return allMachines;
    return allMachines.filter((m) => categoryByTypeId[m.machineTypeId] === selectedCategory);
  }, [allMachines, selectedCategory, categoryByTypeId]);

  const openAddDialog = () => { setEditingMachine(null); setDialogOpen(true); };
  const openEditDialog = (machine) => { setEditingMachine(machine); setDialogOpen(true); };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteMachine(pendingDelete.id, { onSuccess: () => setPendingDelete(null) });
  };

  if (!currentUser?.name) return null;

  return (
    <>
      <Root
        header={
          <MyMachinesHeader
            onRegister={openAddDialog}
            onToggleFilters={isMobile ? () => setLeftSidebarOpen((v) => !v) : undefined}
            onToggleReminders={isMobile ? () => setRightSidebarOpen((v) => !v) : undefined}
          />
        }
        content={
          <div className="w-full px-6 sm:px-10 py-8">
            {isLoading && (
              <div className="flex justify-center py-24">
                <CircularProgress sx={{ color: "#ea580c" }} />
              </div>
            )}

            {isError && (
              <p className="text-center text-gray-500 py-24">Couldn't load your machines. Please try again.</p>
            )}

            {!isLoading && !isError && machines.length === 0 && (
              <div className="text-center py-24 px-6 bg-white rounded-2xl border border-dashed border-gray-200">
                <DirectionsCarIcon sx={{ fontSize: "3rem", color: "#d1d5db" }} />
                <h2 className="text-lg font-bold text-gray-900 mt-3">
                  {allMachines.length === 0 ? "No machines registered yet" : "No machines match that filter"}
                </h2>
                <p className="text-gray-500 mt-1 mb-6">
                  {allMachines.length === 0
                    ? "Register a vehicle, generator, or piece of equipment to book services and track its history."
                    : "Try a different type, or register a new machine."}
                </p>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={openAddDialog}
                  sx={{ backgroundColor: "#ea580c", "&:hover": { backgroundColor: "#c2410c" } }}
                >
                  Register a machine
                </Button>
              </div>
            )}

            {machines.length > 0 && (
              <div className="grid sm:grid-cols-2 gap-5">
                {machines.map((m) => (
                  <MachineCard key={m.id} machine={m} onEdit={openEditDialog} onDelete={setPendingDelete} />
                ))}
              </div>
            )}
          </div>
        }
        leftSidebarOpen={leftSidebarOpen}
        leftSidebarOnClose={() => setLeftSidebarOpen(false)}
        leftSidebarContent={
          <MyMachinesFilterSidebar selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
        }
        rightSidebarOpen={rightSidebarOpen}
        rightSidebarOnClose={() => setRightSidebarOpen(false)}
        rightSidebarContent={<MyMachinesRemindersSidebar machines={allMachines} />}
        scroll="content"
      />

      <RegisterMachineDialog
        open={dialogOpen}
        machine={editingMachine}
        onClose={() => setDialogOpen(false)}
      />

      <Dialog open={Boolean(pendingDelete)} onClose={() => setPendingDelete(null)}>
        <DialogTitle>Remove this machine?</DialogTitle>
        <DialogContent>
          <p className="text-gray-600">
            {pendingDelete?.nickname || "This machine"} will be removed from your account. This can't be undone.
          </p>
        </DialogContent>
        <DialogActions className="px-6 pb-4">
          <Button onClick={() => setPendingDelete(null)} disabled={deleting}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmDelete}
            disabled={deleting}
          >
            {deleting ? <CircularProgress size={20} sx={{ color: "white" }} /> : "Remove"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default MyMachinesPage;
