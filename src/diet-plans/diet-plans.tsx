import { Add } from "@mui/icons-material";
import {
  Button,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalDialog,
  Stack,
  Typography,
} from "@mui/joy";
import { Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDietPlansStore } from "../data/diet-plans-database";

export const DietPlans = () => {
  const navigate = useNavigate();

  const { dietPlans, createDietPlan } = useDietPlansStore();

  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateDietPlan = (name: string) => {
    const id = createDietPlan(name);
    navigate(`/${id}`);
  };

  return (
    <>
      <Stack spacing={8}>
        <Stack justifyContent="space-between" direction="row">
          <Typography level="title-md" fontWeight={700}>
            Your Diet Plans
          </Typography>
          <Button onClick={() => setShowCreateModal(true)}>
            <Add />
            Create diet plan
          </Button>
        </Stack>
        {dietPlans && dietPlans.length > 0 && (
          <Stack spacing={4}>
            {dietPlans.map((dietPlan) => (
              <Fragment key={dietPlan.id}>
                <Stack
                  key={dietPlan.id}
                  spacing={2}
                  direction="row"
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigate(`/${dietPlan.id}`)}
                >
                  <Typography>{dietPlan.name}</Typography>
                  <Typography>
                    {/* {format(new Date(dietPlan.createdAt), "DD MM YYYY")} */}
                  </Typography>
                </Stack>
                <Divider />
              </Fragment>
            ))}
          </Stack>
        )}
        {!dietPlans ||
          (dietPlans.length === 0 && (
            <Typography>No diet plans yet</Typography>
          ))}
      </Stack>
      <CreateDietPlanModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateDietPlan}
      />
    </>
  );
};

const CreateDietPlanModal: React.FC<{
  show: boolean;
  onClose: VoidFunction;
  onCreate: (name: string) => void;
}> = ({ show, onClose, onCreate }) => {
  const [name, setName] = useState("");

  return (
    <Modal
      aria-labelledby="modal-title"
      aria-describedby="modal-desc"
      open={show}
      onClose={() => onClose}
      sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      <ModalDialog>
        <Typography id="basic-modal-dialog-title" level="h2">
          Create new diet plan
        </Typography>

        <Stack spacing={2}>
          <FormControl>
            <FormLabel>Name</FormLabel>
            <Input
              autoFocus
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormControl>
          <Stack spacing={2} direction="row" justifyContent="space-between">
            <Button
              type="button"
              size="sm"
              color="neutral"
              fullWidth
              onClick={() => onClose()}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              color="primary"
              disabled={!name}
              fullWidth
              onClick={() => onCreate(name)}
            >
              Create
            </Button>
          </Stack>
        </Stack>
      </ModalDialog>
    </Modal>
  );
};
