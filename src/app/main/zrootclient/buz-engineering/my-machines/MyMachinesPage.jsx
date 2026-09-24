import { useEffect, useState } from "react";
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import BuildIcon from "@mui/icons-material/Build";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import HistoryIcon from "@mui/icons-material/History";
import { useAppSelector } from "app/store/hooks";
import { selectUser } from "src/app/auth/user/store/userSlice";
import {
  useGetMyRegisteredMachines,
  useDeleteRegisteredMachine,
} from "app/configs/data/server-calls/engineering/useMyMachinesRepo";
import RegisterMachineDialog from "./RegisterMachineDialog";

function MachineCard({ machine, onEdit, onDelete }) {
  const dueSoon = machine.nextServiceDueDate && new Date(machine.nextServiceDueDate) < new Date(Date.now() + 14 * 86400000);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
            <DirectionsCarIcon sx={{ color: "#0f766e" }} />
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
            dueSoon ? "bg-amber-50 text-amber-800" : "bg-teal-50 text-teal-800"
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

/**
 * MyMachinesPage — "My Machines" hub (Phase E6c). Lists every machine the
 * customer has registered platform-wide (not scoped to one shop), lets them
 * register a new one, edit, or remove one. Booking a service happens from a
 * shop's own detail page (BookServiceDialog), which reads from the same
 * '__myMachines' query — this page is the management home, not the only
 * entry point.
 */
function MyMachinesPage() {
  const navigate = useNavigate();
  const currentUser = useAppSelector(selectUser);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    if (!currentUser?.name) navigate("/sign-in");
  }, [currentUser?.name, navigate]);

  const { data: machinesResp, isLoading, isError } = useGetMyRegisteredMachines();
  const machines = machinesResp?.data ?? [];
  const { mutate: deleteMachine, isLoading: deleting } = useDeleteRegisteredMachine();

  const openAddDialog = () => { setEditingMachine(null); setDialogOpen(true); };
  const openEditDialog = (machine) => { setEditingMachine(machine); setDialogOpen(true); };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteMachine(pendingDelete.id, { onSuccess: () => setPendingDelete(null) });
  };

  if (!currentUser?.name) return null;

  return (
    <div className="min-h-full bg-gray-50">
      <div
        className="text-white py-10 px-6 md:px-12"
        style={{ background: "linear-gradient(to bottom right, #0f766e, #134e4a)" }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <BuildIcon sx={{ fontSize: "1.75rem" }} />
            <div>
              <h1 className="text-2xl md:text-3xl font-black">My Machines</h1>
              <p className="text-teal-100 text-sm mt-1">Vehicles, generators &amp; equipment you've registered</p>
            </div>
          </div>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openAddDialog}
            sx={{ backgroundColor: "white", color: "#0f766e", fontWeight: 700, "&:hover": { backgroundColor: "#f0fdfa" } }}
          >
            Register a machine
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-12 py-8">
        {isLoading && (
          <div className="flex justify-center py-24">
            <CircularProgress sx={{ color: "#0f766e" }} />
          </div>
        )}

        {isError && (
          <p className="text-center text-gray-500 py-24">Couldn't load your machines. Please try again.</p>
        )}

        {!isLoading && !isError && machines.length === 0 && (
          <div className="text-center py-24 px-6 bg-white rounded-2xl border border-dashed border-gray-200">
            <DirectionsCarIcon sx={{ fontSize: "3rem", color: "#d1d5db" }} />
            <h2 className="text-lg font-bold text-gray-900 mt-3">No machines registered yet</h2>
            <p className="text-gray-500 mt-1 mb-6">
              Register a vehicle, generator, or piece of equipment to book services and track its history.
            </p>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openAddDialog}
              sx={{ backgroundColor: "#0f766e", "&:hover": { backgroundColor: "#0d5f58" } }}
            >
              Register a machine
            </Button>
          </div>
        )}

        {machines.length > 0 && (
          <div className="grid md:grid-cols-2 gap-5">
            {machines.map((m) => (
              <MachineCard key={m.id} machine={m} onEdit={openEditDialog} onDelete={setPendingDelete} />
            ))}
          </div>
        )}
      </div>

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
    </div>
  );
}

export default MyMachinesPage;
