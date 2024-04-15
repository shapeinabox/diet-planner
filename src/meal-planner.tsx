// import {
//   Autocomplete,
//   Stack,
//   Slider,
//   FormControl,
//   FormLabel,
//   Table,
//   Button,
//   IconButton,
// } from "@mui/joy";
// import Typography from "@mui/joy/Typography";
// import { useEffect, useMemo, useState } from "react";
// import { create } from "zustand";

// import foodItems from "./food-items.json";
// import { FoodItem, MealPlan } from "./types";
// import { Add, DeleteForever } from "@mui/icons-material";

// interface State {
//   baselineFoodItem?: FoodItem;
//   baselineFoodQta: number;
//   mealPlan: MealPlan;
//   setBaselineFoodItem: (foodItem?: FoodItem) => void;
//   setBaselineFoodQta: (qta: number) => void;
//   addFoodItem: (foodItemId: string, qta?: number) => void;
//   removeFoodItem: (foodItemId: string) => void;
//   setFoodItemQta: (foodItemId: string, qta: number) => void;
// }

// const getMealPlanCalories = (mealPlan: MealPlan) => {
//   return mealPlan.foodItems.reduce((acc, item) => {
//     const foodItem = foodItems.find((i) => i.id === item.foodItemId);
//     if (!foodItem) return acc;
//     return acc + (item.qta / foodItem.qta) * foodItem.calories;
//   }, 0);
// };

// const useMealPlannerStore = create<State>((set) => ({
//   baselineFoodItem: undefined,
//   baselineFoodQta: 0,
//   mealPlan: {
//     foodItems: [],
//   },
//   setBaselineFoodItem: (foodItem?: FoodItem) =>
//     set({ baselineFoodItem: foodItem }),
//   setBaselineFoodQta: (qta: number) => set({ baselineFoodQta: qta }),
//   addFoodItem: (foodItemId: string, qta?: number) =>
//     set((state) => ({
//       ...state,
//       mealPlan: {
//         foodItems: [...state.mealPlan.foodItems, { foodItemId, qta: qta ?? 0 }],
//       },
//     })),
//   removeFoodItem: (foodItemId: string) =>
//     set((state) => ({
//       ...state,
//       mealPlan: {
//         foodItems: state.mealPlan.foodItems.filter(
//           (item) => item.foodItemId !== foodItemId
//         ),
//       },
//     })),

//   setFoodItemQta: (foodItemId: string, qta: number) =>
//     set((state) => ({
//       ...state,
//       mealPlan: {
//         foodItems: state.mealPlan.foodItems.map((item) => {
//           if (item.foodItemId === foodItemId) {
//             return { ...item, qta };
//           }
//           return item;
//         }),
//       },
//     })),
// }));

// export const MealPlanner = () => {
//   const { baselineFoodItem, baselineFoodQta } = useMealPlannerStore();

//   return (
//     <Stack spacing={4} p={6}>
//       <Typography level="h2" fontSize="xl" sx={{ mb: 0.5 }}>
//         Meal Planner
//       </Typography>
//       <Stack direction="row" spacing={6}>
//         <Stack spacing={6} flex={2}>
//           <BaselineFoodSelector />
//           {baselineFoodItem && baselineFoodQta > 0 && <MealPlanEditor />}
//         </Stack>
//         <ProportionTable />
//       </Stack>
//     </Stack>
//   );
// };

// const BaselineFoodSelector = () => {
//   const {
//     baselineFoodItem,
//     baselineFoodQta,
//     setBaselineFoodItem,
//     setBaselineFoodQta,
//   } = useMealPlannerStore();

//   useEffect(
//     () => setBaselineFoodQta(0),
//     [setBaselineFoodQta, baselineFoodItem]
//   );

//   const foodItemOptions = useMemo(
//     () =>
//       (foodItems as FoodItem[]).map((item) => ({
//         id: item.id,
//         label: item.name,
//       })),
//     []
//   );

//   const selectedBaselineFoodItem = useMemo(
//     () => foodItemOptions.find((item) => item.id === baselineFoodItem?.id),
//     [foodItemOptions, baselineFoodItem]
//   );

//   return (
//     <Stack spacing={1}>
//       <Autocomplete
//         placeholder="Select baseline food item"
//         options={foodItemOptions}
//         value={selectedBaselineFoodItem}
//         onChange={(e, newValue) =>
//           setBaselineFoodItem(
//             (foodItems as FoodItem[]).find((item) => item.id === newValue?.id)
//           )
//         }
//       />
//       {baselineFoodItem && (
//         <FormControl>
//           <FormLabel>Quantity</FormLabel>
//           <Slider
//             aria-label="Baseline food item quantity"
//             defaultValue={baselineFoodItem.qta}
//             step={1}
//             valueLabelDisplay="on"
//             min={0}
//             max={baselineFoodItem.qta === 1 ? 20 : 1000}
//             value={baselineFoodQta}
//             onChange={(e, value) => setBaselineFoodQta(value as number)}
//           />
//         </FormControl>
//       )}
//     </Stack>
//   );
// };

// const ProportionTable = () => {
//   const { baselineFoodItem } = useMealPlannerStore();

//   return (
//     <Stack flex={2}>
//       {!baselineFoodItem && (
//         <Typography>Select a baseline food item</Typography>
//       )}
//       {baselineFoodItem && (
//         <Table aria-label="basic table">
//           <thead>
//             <tr>
//               <th style={{ width: "40%" }}>FOOD</th>
//               <th>QTA</th>
//               <th></th>
//             </tr>
//           </thead>
//           <tbody>
//             {(foodItems as FoodItem[]).map((item) => (
//               <ProportionsTableRow key={item.id} foodItem={item} />
//             ))}
//           </tbody>
//         </Table>
//       )}
//     </Stack>
//   );
// };

// const ProportionsTableRow: React.FC<{ foodItem: FoodItem }> = ({
//   foodItem,
// }) => {
//   const { baselineFoodItem, baselineFoodQta, addFoodItem, mealPlan } =
//     useMealPlannerStore();

//   const mealPlanCalories = useMealPlannerStore((state) =>
//     getMealPlanCalories(state.mealPlan)
//   );

//   const isInMealPlan = useMemo(() => {
//     return mealPlan.foodItems.some((item) => item.foodItemId === foodItem.id);
//   }, [mealPlan, foodItem.id]);

//   const foodItemValues = useMemo(() => {
//     if (!baselineFoodItem) return { qta: 0, calories: 0 };
//     const baselineCalories =
//       (baselineFoodItem.calories / baselineFoodItem.qta) * baselineFoodQta;
//     const minusMealPlanCalories = baselineCalories - mealPlanCalories;
//     const qta = Math.floor(
//       (minusMealPlanCalories / foodItem.calories) * foodItem.qta
//     );
//     return {
//       qta,
//       calories: Math.floor((qta / foodItem.qta) * foodItem.calories),
//     };
//   }, [foodItem, mealPlanCalories, baselineFoodItem, baselineFoodQta]);

//   return (
//     <tr>
//       <td>{foodItem.name}</td>
//       <td>{foodItemValues.qta}</td>
//       <td>
//         <Button
//           size="sm"
//           onClick={() => addFoodItem(foodItem.id, foodItemValues.qta)}
//           disabled={isInMealPlan}
//         >
//           <Add />
//           Add
//         </Button>
//       </td>
//     </tr>
//   );
// };

// const MealPlanEditor = () => {
//   const [selectedItem, setSelectedItem] = useState<string | undefined>("");

//   const { mealPlan, addFoodItem } = useMealPlannerStore();

//   const foodItemOptions = useMemo(
//     () =>
//       (foodItems as FoodItem[]).map((item) => ({
//         id: item.id,
//         label: item.name,
//       })),
//     []
//   );

//   const selectedBaselineFoodItemOption = useMemo(
//     () => foodItemOptions.find((item) => item.id === selectedItem),
//     [foodItemOptions, selectedItem]
//   );

//   return (
//     <Stack spacing={4}>
//       <Stack spacing={2}>
//         <Autocomplete
//           placeholder="Add item to plan"
//           options={foodItemOptions}
//           value={selectedBaselineFoodItemOption}
//           onChange={(e, newValue) => setSelectedItem(newValue?.id ?? "")}
//         />
//         <Button
//           size="sm"
//           disabled={!selectedBaselineFoodItemOption}
//           onClick={() => {
//             if (selectedItem) {
//               addFoodItem(selectedItem);
//             }
//           }}
//         >
//           Add
//         </Button>
//       </Stack>
//       {mealPlan.foodItems.map((item) => (
//         <MealPlanItem key={item.foodItemId} foodItem={item} />
//       ))}
//     </Stack>
//   );
// };

// const MealPlanItem: React.FC<{
//   foodItem: { foodItemId: string; qta: number };
// }> = ({ foodItem }) => {
//   const baseFoodItem = useMemo(
//     () => foodItems.find((item) => item.id === foodItem.foodItemId),
//     [foodItem.foodItemId]
//   );

//   const { setFoodItemQta, removeFoodItem } = useMealPlannerStore();

//   return (
//     <Stack spacing={2} direction="row">
//       <Typography>{baseFoodItem?.name}</Typography>
//       <Slider
//         aria-label="Baseline food item quantity"
//         defaultValue={foodItem.qta}
//         step={1}
//         valueLabelDisplay="on"
//         min={0}
//         max={baseFoodItem?.qta === 1 ? 20 : 1000}
//         value={foodItem.qta}
//         onChange={(e, value) =>
//           setFoodItemQta(foodItem.foodItemId, value as number)
//         }
//       />
//       <IconButton onClick={() => removeFoodItem(foodItem.foodItemId)}>
//         <DeleteForever />
//       </IconButton>
//     </Stack>
//   );
// };
