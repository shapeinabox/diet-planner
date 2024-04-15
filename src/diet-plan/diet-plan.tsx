import {
  AddCircle,
  ContentCopy,
  ContentPaste,
  InfoOutlined,
  RemoveCircle,
  Save,
} from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Stack,
  Typography,
  styled,
} from "@mui/joy";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  MacroGroup,
  MacroType,
  MealType,
  days,
  getDayCalories,
  getDietPlanMeal,
  getDietPlanWeekIds,
  getMacroGroupCalories,
  getMealCalories,
  getMealTypeDaysIds,
  mealTypes,
  useDietPlanStore,
} from "../data/diet-plans-database";
import { getFoodItemCalories } from "../data/food-items-database";
import { EditMealModal } from "./edit-meal";
import { DayDetailsModal } from "./day-details";

export const DietPlanRoute = () => {
  const { dietPlanId } = useParams<{ dietPlanId: string }>();

  const { dietPlan, loadDietPlan } = useDietPlanStore();

  useEffect(() => {
    if (dietPlanId && dietPlan.id !== dietPlanId) {
      loadDietPlan(dietPlanId);
    }
  }, [dietPlan, dietPlanId, loadDietPlan]);

  if (!dietPlan) {
    return <CircularProgress variant="solid" />;
  }

  return <DietPlan />;
};

const DietPlan: React.FC = () => {
  const { dietPlan, saveDietPlan } = useDietPlanStore();

  return (
    <Stack spacing={8}>
      <Stack
        spacing={2}
        direction="row"
        justifyContent="space-between"
        alignContent="center"
      >
        <Stack spacing={2}>
          <Typography level="title-md" fontWeight={700}>
            {dietPlan.name}
          </Typography>
          {/* <Typography level="title-sm">
            {format(new Date(dietPlan.createdAt), "DD MM YYYY")}
          </Typography> */}
        </Stack>
        <Box>
          <Button color="primary" onClick={saveDietPlan}>
            <Save /> Save
          </Button>
        </Box>
      </Stack>
      <DietPlanWeeks />
    </Stack>
  );
};

const DietPlanWeeks: React.FC = () => {
  const weekIds = useDietPlanStore(getDietPlanWeekIds);

  return (
    <Stack spacing={8}>
      {weekIds.map((weekId) => (
        <DietPlanWeek key={weekId} weekId={weekId} />
      ))}
    </Stack>
  );
};

const DietPlanWeek: React.FC<{ weekId: string }> = ({ weekId }) => {
  return (
    <Stack spacing={8}>
      <Typography level="title-sm">Week</Typography>
      <StyledTable>
        <thead>
          <tr>
            <th></th>
            {days.map((day) => (
              <StyledTH key={day}>
                <DayHeader weekId={weekId} dayId={day} />
              </StyledTH>
            ))}
          </tr>
        </thead>
        <tbody>
          {mealTypes.map((mealType) => (
            <DietPlanMealRow
              key={mealType}
              weekId={weekId}
              mealType={mealType}
            />
          ))}
        </tbody>
      </StyledTable>
    </Stack>
  );
};

const DayHeader: React.FC<{ weekId: string; dayId: string }> = ({
  weekId,
  dayId,
}) => {
  const dayCalories = useDietPlanStore((state) =>
    getDayCalories(state, { weekId, dayId })
  );

  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <Stack direction="row" spacing={2} justifyContent="space-around" alignItems="center">
        <Typography level="title-lg" sx={{ textTransform: "capitalize" }}>
          {dayId}
        </Typography>
        {dayCalories > 0 && (
          <Typography level="title-sm">
            {Math.floor(dayCalories)} kcal
          </Typography>
        )}
        <IconButton
          aria-label="Show details"
          size="sm"
          variant="plain"
          onClick={() => setShowDetails(true)}
        >
          <InfoOutlined fontSize="small" />
        </IconButton>
      </Stack>
      {showDetails && (
        <DayDetailsModal
          weekId={weekId}
          dayId={dayId}
          show={showDetails}
          onClose={() => setShowDetails(false)}
        />
      )}
    </>
  );
};

const DietPlanMealRow: React.FC<{ weekId: string; mealType: MealType }> = ({
  weekId,
  mealType,
}) => {
  const weekDaysIds = useDietPlanStore((state) =>
    getMealTypeDaysIds(state, { weekId, mealType })
  );

  return (
    <tr>
      <StyledMealTypeTD>{mealType}</StyledMealTypeTD>
      {weekDaysIds.map((dayId) => (
        <StyledMealTD key={dayId}>
          <MealCell dayId={dayId} mealType={mealType} weekId={weekId} />
        </StyledMealTD>
      ))}
    </tr>
  );
};

const MealCell: React.FC<{
  weekId: string;
  dayId: string;
  mealType: MealType;
}> = ({ weekId, dayId, mealType }) => {
  const { copiedMeal, copyMeal, pasteMeal } = useDietPlanStore();

  const meal = useDietPlanStore((state) =>
    getDietPlanMeal(state, { weekId, mealType, dayId })
  );

  const mealCalories = useDietPlanStore((state) =>
    getMealCalories(state, { weekId, mealType, dayId })
  );

  return (
    <Stack spacing={2} p={1}>
      <Stack spacing={2} justifyContent="right" direction="row">
        <IconButton
          aria-label="Copy meal"
          size="sm"
          variant="plain"
          onClick={() => copyMeal({ weekId, dayId, mealType })}
          disabled={mealCalories <= 0}
        >
          <ContentCopy fontSize="small" />
        </IconButton>
        <IconButton
          aria-label="Paste meal"
          size="sm"
          variant="plain"
          onClick={() => pasteMeal({ weekId, dayId, mealType })}
          disabled={!copiedMeal}
        >
          <ContentPaste fontSize="small" />
        </IconButton>
      </Stack>
      <MealMacroGroup
        key="carbs"
        type="carbs"
        macroGroup={meal.macro.carbs}
        weekId={weekId}
        dayId={dayId}
        mealType={mealType}
      />
      <Divider />
      <MealMacroGroup
        key="proteins"
        type="proteins"
        macroGroup={meal.macro.proteins}
        weekId={weekId}
        dayId={dayId}
        mealType={mealType}
      />
      <Divider />
      <MealMacroGroup
        key="fats"
        type="fats"
        macroGroup={meal.macro.fats}
        weekId={weekId}
        dayId={dayId}
        mealType={mealType}
      />
      {mealCalories > 0 && (
        <>
          <Divider />
          <Stack>
            <Typography textAlign="center" level="body-xs" fontWeight={600}>
              {Math.floor(mealCalories)} kcal
            </Typography>
          </Stack>
        </>
      )}
    </Stack>
  );
};

const MealMacroGroup: React.FC<{
  weekId: string;
  dayId: string;
  mealType: MealType;
  type: MacroType;
  macroGroup: MacroGroup;
}> = ({ weekId, dayId, mealType, type, macroGroup }) => {
  const { removeFoodItem: removeMealItem } = useDietPlanStore();

  const groupCalories = useDietPlanStore((state) =>
    getMacroGroupCalories(state, { weekId, dayId, mealType, macroType: type })
  );

  const [editMacroModal, setEditMacroModal] = React.useState(false);

  return (
    <>
      <Stack spacing={2}>
        <Stack
          justifyContent="space-between"
          alignItems="center"
          direction="row"
        >
          <Typography
            sx={{ textTransform: "capitalize" }}
            level="body-xs"
            fontWeight={600}
            color="neutral"
          >
            {type}
          </Typography>
          {groupCalories > 0 && (
            <Typography level="body-xs" fontWeight={600}>
              {Math.floor(groupCalories)} kcal
            </Typography>
          )}
          <IconButton
            variant="plain"
            size="sm"
            onClick={() => setEditMacroModal(true)}
          >
            <AddCircle fontSize="small" />
          </IconButton>
        </Stack>
        {macroGroup.items.map((item) => (
          <Stack
            key={item.itemId}
            spacing={2}
            direction="row"
            alignItems="center"
          >
            <IconButton
              variant="plain"
              size="sm"
              onClick={() =>
                removeMealItem(weekId, dayId, mealType, type, item.itemId)
              }
            >
              <RemoveCircle fontSize="small" />
            </IconButton>
            <Typography level="body-xs">{item.name}</Typography>
            <Typography level="body-sm">{item.qta}</Typography>
            <Typography level="body-sm">
              {getFoodItemCalories(item.itemId, item.qta)} kcal
            </Typography>
          </Stack>
        ))}
      </Stack>
      <EditMealModal
        show={editMacroModal}
        onClose={() => setEditMacroModal(false)}
        weekId={weekId}
        dayId={dayId}
        mealType={mealType}
        macroType={type}
      />
    </>
  );
};

const StyledTable = styled("table")`
  border-collapse: separate;
  border-spacing: 4px;

  thead {
    border: none !important;
    tr {
      border: none !important;
      background-color: transparent !important;
    }
  }

  tr {
    border: none;
    background-color: transparent !important;
    td {
      border: 2px solid lightgrey;
      border-radius: 8px;
    }
    td:first-child {
      border: none;
    }
  }
`;

const StyledTH = styled("th")`
  text-align: center;
  text-transform: capitalize;
`;

const StyledMealTypeTD = styled("td")`
  width: 100px;
  text-transform: capitalize;
`;

const StyledMealTD = styled("td")`
  vertical-align: baseline;
  width: 168px;
`;
