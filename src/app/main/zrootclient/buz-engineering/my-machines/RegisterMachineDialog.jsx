import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import useGetMachineTypes from "app/configs/data/server-calls/engineering/useMachineTypesRepo";
import {
  useCreateRegisteredMachine,
  useUpdateRegisteredMachine,
} from "app/configs/data/server-calls/engineering/useMyMachinesRepo";

const emptyForm = {
  machineTypeId: "",
  vin: "",
  plateNumber: "",
  serialNumber: "",
  mileage: "",
  engineHours: "",
  nickname: "",
};

/**
 * RegisterMachineDialog — add a new machine or edit an existing one
 * (Phase E6c). Reused both from MyMachinesPage directly and from
 * BookServiceDialog's inline "register a new machine" shortcut, so
 * onRegistered lets a caller react to the freshly created machine (e.g.
 * auto-select it for the booking in progress) without re-fetching.
 */
function RegisterMachineDialog({ open, onClose, machine = null, onRegistered }) {
  const isEditing = Boolean(machine?.id);
  const [form, setForm] = useState(emptyForm);

  const { data: typesResp, isLoading: typesLoading } = useGetMachineTypes();
  const machineTypes = typesResp?.data ?? [];

  const { mutate: createMachine, isLoading: creating } = useCreateRegisteredMachine();
  const { mutate: updateMachine, isLoading: updating } = useUpdateRegisteredMachine();
  const saving = creating || updating;

  useEffect(() => {
    if (!open) return;
    setForm(
      machine
        ? {
            machineTypeId: machine.machineTypeId ?? "",
            vin: machine.vin ?? "",
            plateNumber: machine.plateNumber ?? "",
            serialNumber: machine.serialNumber ?? "",
            mileage: machine.mileage ?? "",
            engineHours: machine.engineHours ?? "",
            nickname: machine.nickname ?? "",
          }
        : emptyForm,
    );
  }, [open, machine]);

  const selectedType = useMemo(
    () => machineTypes.find((t) => t.id === form.machineTypeId) ?? null,
    [machineTypes, form.machineTypeId],
  );

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = () => {
    const payload = {
      machineTypeId: form.machineTypeId,
      vin: form.vin || undefined,
      plateNumber: form.plateNumber || undefined,
      serialNumber: form.serialNumber || undefined,
      mileage: form.mileage === "" ? undefined : Number(form.mileage),
      engineHours: form.engineHours === "" ? undefined : Number(form.engineHours),
      nickname: form.nickname || undefined,
    };

    if (isEditing) {
      updateMachine(
        { machineId: machine.id, formData: payload },
        { onSuccess: (resp) => { onRegistered?.(resp?.data); onClose(); } },
      );
    } else {
      createMachine(payload, {
        onSuccess: (resp) => { onRegistered?.(resp?.data); onClose(); },
      });
    }
  };

  const canSubmit = Boolean(form.machineTypeId) && !saving;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEditing ? "Edit Machine" : "Register a Machine"}</DialogTitle>
      <DialogContent className="flex flex-col gap-4 pt-2">
        <Autocomplete
          options={machineTypes}
          loading={typesLoading}
          value={selectedType}
          getOptionLabel={(t) => `${t.make} ${t.model}${t.yearRange ? ` (${t.yearRange})` : ""}`}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          onChange={(_e, value) => setForm((f) => ({ ...f, machineTypeId: value?.id ?? "" }))}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Make / Model"
              required
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {typesLoading && <CircularProgress size={18} />}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />

        <TextField
          label="Nickname"
          placeholder='e.g. "Office Generator" or "My Honda Accord"'
          fullWidth
          value={form.nickname}
          onChange={handleChange("nickname")}
        />

        <div className="grid grid-cols-2 gap-4">
          <TextField label="Plate number" fullWidth value={form.plateNumber} onChange={handleChange("plateNumber")} />
          <TextField label="VIN" fullWidth value={form.vin} onChange={handleChange("vin")} />
          <TextField label="Serial number" fullWidth value={form.serialNumber} onChange={handleChange("serialNumber")} />
          <TextField
            label="Mileage (km)"
            type="number"
            fullWidth
            value={form.mileage}
            onChange={handleChange("mileage")}
          />
        </div>
        <TextField
          label="Engine hours"
          type="number"
          fullWidth
          value={form.engineHours}
          onChange={handleChange("engineHours")}
          helperText="Only relevant for generators / heavy equipment"
        />
      </DialogContent>
      <DialogActions className="px-6 pb-4">
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!canSubmit}
          sx={{ backgroundColor: "#0f766e", "&:hover": { backgroundColor: "#0d5f58" } }}
        >
          {saving ? <CircularProgress size={20} sx={{ color: "white" }} /> : isEditing ? "Save changes" : "Register machine"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default RegisterMachineDialog;
