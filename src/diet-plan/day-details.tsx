import { Box, Modal, ModalClose, ModalDialog, Table } from "@mui/joy";
import {
  MealType,
  getDayMealMacro,
  getDayTotalMacro,
  macroTypes,
  mealTypes,
  useDietPlanStore,
} from "../data/diet-plans-database";

export const DayDetailsModal: React.FC<{
  weekId: string;
  dayId: string;
  show: boolean;
  onClose: VoidFunction;
}> = ({ weekId, dayId, show, onClose }) => {
  return (
    <Modal open={show} onClose={onClose}>
      <ModalDialog layout="center">
        <ModalClose />
        <Box>
          <Table>
            <thead>
              <th></th>
              {macroTypes.map((macroType) => (
                <th key={macroType}>{macroType}</th>
              ))}
            </thead>
            <tbody>
              {mealTypes.map((mealType) => (
                <DayMealDetailsRow
                  key={mealType}
                  weekId={weekId}
                  dayId={dayId}
                  mealType={mealType}
                />
              ))}
            </tbody>
            <tfoot>
              <th>DAY TOTAL</th>
              <DayDetailsTotalRow weekId={weekId} dayId={dayId} />
            </tfoot>
          </Table>
        </Box>
      </ModalDialog>
    </Modal>
  );
};

const DayMealDetailsRow: React.FC<{
  weekId: string;
  dayId: string;
  mealType: MealType;
}> = ({ weekId, dayId, mealType }) => {
  const macros = useDietPlanStore((state) =>
    getDayMealMacro(state, { weekId, dayId, mealType })
  );

  return (
    <tr>
      <td>{mealType}</td>
      {macroTypes.map((macroType) => (
        <td key={macroType}>{Math.floor(macros[macroType])}</td>
      ))}
    </tr>
  );
};

const DayDetailsTotalRow: React.FC<{
  weekId: string;
  dayId: string;
}> = ({ weekId, dayId }) => {
  const totalMacro = useDietPlanStore((state) =>
    getDayTotalMacro(state, { weekId, dayId })
  );

  return (
    <>
      {macroTypes.map((macroType) => (
        <td key={macroType}>{Math.floor(totalMacro[macroType])}</td>
      ))}
    </>
  );
};
