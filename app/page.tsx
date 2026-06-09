"use client";

import { useEffect, useMemo, useState } from "react";

type GoalType = "body_recomp" | "fat_loss" | "muscle_gain";

type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

type Tab =
  | "home"
  | "add"
  | "workout"
  | "database"
  | "history"
  | "goals"
  | "profiles";

type FoodSource =
  | "manual"
  | "open_food_facts"
  | "usda"
  | "ai_estimate"
  | "local_default"
  | "local_fallback";

type Confidence = "high" | "medium" | "low";

type WorkoutType =
  | "push"
  | "pull"
  | "leg"
  | "chest"
  | "back"
  | "tricep"
  | "bicep"
  | "shoulder"
  | "cardio"
  | "rest"
  | "custom";

type WorkoutIntensity = "light" | "moderate" | "hard";

type WorkoutSource =
  | "manual"
  | "apple_health"
  | "garmin"
  | "fitbit"
  | "huawei_health"
  | "samsung_health";

type UserProfile = {
  weight: number;
  height: number;
  age: number;
  bodyFat: number;
  goalType: GoalType;
  activityLevel: ActivityLevel;
};

type Targets = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type Food = {
  id: string;
  name: string;
  baseAmount: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  source?: FoodSource;
  confidence?: Confidence;
  verified?: boolean;
  sourceUrl?: string;
  notes?: string;
  brand?: string;
};

type MealLog = {
  id: string;
  foodId: string;
  name: string;
  amount: number;
  unit: string;
  baseAmount: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: string;
};

type WorkoutLog = {
  id: string;
  types: WorkoutType[];
  label: string;
  durationMinutes: number;
  intensity: WorkoutIntensity;
  caloriesBurned: number;
  caloriesSource: WorkoutSource;
  notes?: string;

  // เผื่อเชื่อม smartwatch ในอนาคต
  externalWorkoutId?: string;
  syncedAt?: string;
  deviceName?: string;
};

type DailyLogs = Record<string, MealLog[]>;
type DailyWorkouts = Record<string, WorkoutLog[]>;

type MacroMateUser = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  profile: UserProfile;
  targets: Targets;
  foods: Food[];
  dailyLogs: DailyLogs;
  dailyWorkouts: DailyWorkouts;
  selectedDate: string;
};

const defaultProfile: UserProfile = {
  weight: 100,
  height: 185,
  age: 29,
  bodyFat: 30,
  goalType: "body_recomp",
  activityLevel: "moderate",
};

const defaultTargets: Targets = {
  calories: 2400,
  protein: 180,
  carbs: 250,
  fat: 70,
};

const defaultFoods: Food[] = [
  {
    id: "rice",
    name: "ข้าวสวย",
    baseAmount: 100,
    unit: "g",
    calories: 130,
    protein: 2.7,
    carbs: 28,
    fat: 0.3,
    source: "local_default",
    confidence: "high",
    verified: true,
    notes: "ค่าเริ่มต้นโดยประมาณต่อ 100g",
  },
  {
    id: "chicken",
    name: "อกไก่",
    baseAmount: 100,
    unit: "g",
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    source: "local_default",
    confidence: "high",
    verified: true,
  },
  {
    id: "dory",
    name: "ปลาดอลลี่",
    baseAmount: 100,
    unit: "g",
    calories: 90,
    protein: 19,
    carbs: 0,
    fat: 1,
    source: "local_default",
    confidence: "medium",
    verified: true,
  },
  {
    id: "egg",
    name: "ไข่ไก่",
    baseAmount: 1,
    unit: "ฟอง",
    calories: 70,
    protein: 6,
    carbs: 0.6,
    fat: 5,
    source: "local_default",
    confidence: "high",
    verified: true,
  },
  {
    id: "whey",
    name: "เวย์โปรตีน",
    baseAmount: 1,
    unit: "scoop",
    calories: 120,
    protein: 24,
    carbs: 3,
    fat: 1.5,
    source: "local_default",
    confidence: "medium",
    verified: true,
  },
  {
    id: "greek-yogurt",
    name: "กรีกโยเกิร์ต",
    baseAmount: 150,
    unit: "g",
    calories: 90,
    protein: 9,
    carbs: 8,
    fat: 2,
    source: "local_default",
    confidence: "medium",
    verified: true,
  },
  {
    id: "banana",
    name: "กล้วย",
    baseAmount: 1,
    unit: "ลูก",
    calories: 105,
    protein: 1.3,
    carbs: 27,
    fat: 0.3,
    source: "local_default",
    confidence: "medium",
    verified: true,
  },
  {
    id: "beef",
    name: "เนื้อวัวไม่ติดมัน",
    baseAmount: 100,
    unit: "g",
    calories: 190,
    protein: 26,
    carbs: 0,
    fat: 9,
    source: "local_default",
    confidence: "medium",
    verified: true,
  },
];

const workoutOptions: {
  type: WorkoutType;
  label: string;
}[] = [
  { type: "push", label: "Push" },
  { type: "pull", label: "Pull" },
  { type: "leg", label: "Leg" },
  { type: "chest", label: "Chest" },
  { type: "back", label: "Back" },
  { type: "tricep", label: "Tricep" },
  { type: "bicep", label: "Bicep" },
  { type: "shoulder", label: "Shoulder" },
  { type: "cardio", label: "Cardio" },
  { type: "rest", label: "Rest" },
];

const activityOptions: Record<ActivityLevel, { label: string; factor: number }> =
  {
    sedentary: {
      label: "นั่งทำงานเป็นหลัก / ไม่ค่อยออกกำลังกาย",
      factor: 1.2,
    },
    light: {
      label: "ออกกำลังกายเบา 1-3 วัน/สัปดาห์",
      factor: 1.375,
    },
    moderate: {
      label: "ออกกำลังกาย 3-5 วัน/สัปดาห์",
      factor: 1.55,
    },
    active: {
      label: "ออกกำลังกายหนัก 6-7 วัน/สัปดาห์",
      factor: 1.725,
    },
    very_active: {
      label: "ออกกำลังกายหนักมาก / ใช้แรงงานสูง",
      factor: 1.9,
    },
  };

function todayString() {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

function round1(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 10) / 10;
}

function calculateBmr(profile: UserProfile) {
  return 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
}

function calculateTdee(profile: UserProfile) {
  const bmr = calculateBmr(profile);
  const factor = activityOptions[profile.activityLevel].factor;
  return bmr * factor;
}

function caloriesFromMacros(targets: Targets) {
  return targets.protein * 4 + targets.carbs * 4 + targets.fat * 9;
}

function calcCarbsFromCalories(calories: number, protein: number, fat: number) {
  return Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4));
}

function calcFatFromCalories(calories: number, protein: number, carbs: number) {
  return Math.max(0, Math.round((calories - protein * 4 - carbs * 4) / 9));
}

function calcByAmount(food: Food, amount: number) {
  const safeAmount = Number.isFinite(amount) ? Math.max(0, amount) : 0;
  const ratio = food.baseAmount > 0 ? safeAmount / food.baseAmount : 0;

  return {
    calories: round1(food.calories * ratio),
    protein: round1(food.protein * ratio),
    carbs: round1(food.carbs * ratio),
    fat: round1(food.fat * ratio),
  };
}

function calculateRecommendedTargets(profile: UserProfile): Targets {
  const tdee = calculateTdee(profile);

  let calories = tdee;

  if (profile.goalType === "fat_loss") calories = tdee - 500;
  if (profile.goalType === "body_recomp") calories = tdee - 250;
  if (profile.goalType === "muscle_gain") calories = tdee + 250;

  const roundedCalories = Math.round(calories / 50) * 50;

  let proteinMultiplier = 1.8;
  let fatMultiplier = 0.7;

  if (profile.goalType === "fat_loss") {
    proteinMultiplier = 2.0;
    fatMultiplier = 0.65;
  }

  if (profile.goalType === "body_recomp") {
    proteinMultiplier = 1.8;
    fatMultiplier = 0.7;
  }

  if (profile.goalType === "muscle_gain") {
    proteinMultiplier = 2.0;
    fatMultiplier = 0.8;
  }

  const protein = Math.round(profile.weight * proteinMultiplier);
  const fat = Math.round(profile.weight * fatMultiplier);
  const carbs = calcCarbsFromCalories(roundedCalories, protein, fat);

  return {
    calories: roundedCalories,
    protein,
    carbs,
    fat,
  };
}

function getMonthStart(date: string) {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function formatMonthTitle(date: Date) {
  return date.toLocaleDateString("th-TH", {
    month: "long",
    year: "numeric",
  });
}

function toDateString(date: Date) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

function getCalendarDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay();
  const mondayStartOffset = startDay === 0 ? 6 : startDay - 1;

  const days: Array<{
    date: Date;
    dateString: string;
    isCurrentMonth: boolean;
  }> = [];

  const calendarStart = new Date(firstDay);
  calendarStart.setDate(firstDay.getDate() - mondayStartOffset);

  for (let i = 0; i < 42; i++) {
    const date = new Date(calendarStart);
    date.setDate(calendarStart.getDate() + i);

    days.push({
      date,
      dateString: toDateString(date),
      isCurrentMonth: date.getMonth() === month,
    });
  }

  return days;
}

function getTotalsFromLogs(logs: MealLog[]) {
  return logs.reduce(
    (sum, item) => {
      sum.calories += item.calories;
      sum.protein += item.protein;
      sum.carbs += item.carbs;
      sum.fat += item.fat;
      return sum;
    },
    {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    }
  );
}

function getWorkoutCalories(workouts: WorkoutLog[]) {
  return workouts.reduce((sum, item) => sum + (item.caloriesBurned ?? 0), 0);
}

const STORAGE_KEY = "macromate-v2";
const LEGACY_STORAGE_KEY = "macromate-v1";

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function makeDefaultUser(name = "ผู้ใช้หลัก"): MacroMateUser {
  const now = new Date().toISOString();

  return {
    id: createId("user"),
    name,
    createdAt: now,
    updatedAt: now,
    profile: defaultProfile,
    targets: defaultTargets,
    foods: defaultFoods,
    dailyLogs: {},
    dailyWorkouts: {},
    selectedDate: todayString(),
  };
}

function buildUserFromLegacyData(parsed: any): MacroMateUser {
  const now = new Date().toISOString();

  return {
    id: createId("user"),
    name: "ผู้ใช้หลัก",
    createdAt: now,
    updatedAt: now,
    profile: {
      ...defaultProfile,
      ...(parsed?.profile ?? {}),
    },
    targets: parsed?.targets ?? defaultTargets,
    foods: parsed?.foods ?? defaultFoods,
    dailyLogs: parsed?.dailyLogs ?? {},
    dailyWorkouts: parsed?.dailyWorkouts ?? {},
    selectedDate: parsed?.selectedDate ?? todayString(),
  };
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [users, setUsers] = useState<MacroMateUser[]>([]);
  const [activeUserId, setActiveUserId] = useState("");
  const [selectedDate, setSelectedDate] = useState(todayString());
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [targets, setTargets] = useState<Targets>(defaultTargets);
  const [foods, setFoods] = useState<Food[]>(defaultFoods);
  const [dailyLogs, setDailyLogs] = useState<DailyLogs>({});
  const [dailyWorkouts, setDailyWorkouts] = useState<DailyWorkouts>({});
  const [amountInputs, setAmountInputs] = useState<Record<string, number>>({});

  function loadUserData(user: MacroMateUser) {
    setProfile({
      ...defaultProfile,
      ...(user.profile ?? {}),
    });
    setTargets(user.targets ?? defaultTargets);
    setFoods(user.foods ?? defaultFoods);
    setDailyLogs(user.dailyLogs ?? {});
    setDailyWorkouts(user.dailyWorkouts ?? {});
    setSelectedDate(user.selectedDate ?? todayString());
    setAmountInputs({});
  }

  function getUsersWithCurrentData(sourceUsers = users) {
    if (!activeUserId) return sourceUsers;

    const now = new Date().toISOString();

    return sourceUsers.map((user) => {
      if (user.id !== activeUserId) return user;

      return {
        ...user,
        updatedAt: now,
        profile,
        targets,
        foods,
        dailyLogs,
        dailyWorkouts,
        selectedDate,
      };
    });
  }

  function persistUsers(nextUsers: MacroMateUser[], nextActiveUserId: string) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        activeUserId: nextActiveUserId,
        users: nextUsers,
      })
    );
  }

  useEffect(() => {
    let nextUsers: MacroMateUser[] = [];
    let nextActiveUserId = "";

    const savedV2 = localStorage.getItem(STORAGE_KEY);

    if (savedV2) {
      try {
        const parsed = JSON.parse(savedV2);

        if (Array.isArray(parsed.users) && parsed.users.length > 0) {
          nextUsers = parsed.users;
          nextActiveUserId =
            parsed.activeUserId &&
            nextUsers.some((user: MacroMateUser) => user.id === parsed.activeUserId)
              ? parsed.activeUserId
              : nextUsers[0].id;
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    if (nextUsers.length === 0) {
      const savedV1 = localStorage.getItem(LEGACY_STORAGE_KEY);

      if (savedV1) {
        try {
          const parsed = JSON.parse(savedV1);
          const migratedUser = buildUserFromLegacyData(parsed);
          nextUsers = [migratedUser];
          nextActiveUserId = migratedUser.id;
        } catch {
          localStorage.removeItem(LEGACY_STORAGE_KEY);
        }
      }
    }

    if (nextUsers.length === 0) {
      const firstUser = makeDefaultUser("ผู้ใช้หลัก");
      nextUsers = [firstUser];
      nextActiveUserId = firstUser.id;
    }

    const activeUser =
      nextUsers.find((user) => user.id === nextActiveUserId) ?? nextUsers[0];

    setUsers(nextUsers);
    setActiveUserId(activeUser.id);
    loadUserData(activeUser);
    persistUsers(nextUsers, activeUser.id);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !activeUserId || users.length === 0) return;

    const nextUsers = getUsersWithCurrentData();
    persistUsers(nextUsers, activeUserId);
  }, [
    mounted,
    activeUserId,
    users,
    profile,
    targets,
    foods,
    dailyLogs,
    dailyWorkouts,
    selectedDate,
  ]);
  const logsToday = dailyLogs[selectedDate] ?? [];
  const workoutsToday = dailyWorkouts[selectedDate] ?? [];

  const totals = useMemo(() => {
    return getTotalsFromLogs(logsToday);
  }, [logsToday]);

  const historyDates = useMemo(() => {
    const dates = new Set([
      ...Object.keys(dailyLogs).filter(
        (date) => (dailyLogs[date] ?? []).length > 0
      ),
      ...Object.keys(dailyWorkouts).filter(
        (date) => (dailyWorkouts[date] ?? []).length > 0
      ),
    ]);

    return Array.from(dates).sort((a, b) => b.localeCompare(a));
  }, [dailyLogs, dailyWorkouts]);

  const activeUserName =
    users.find((user) => user.id === activeUserId)?.name ?? "ผู้ใช้หลัก";

  function switchUser(userId: string) {
    if (userId === activeUserId) return;

    const latestUsers = getUsersWithCurrentData();
    const nextUser = latestUsers.find((user) => user.id === userId);

    if (!nextUser) return;

    setUsers(latestUsers);
    setActiveUserId(nextUser.id);
    loadUserData(nextUser);
    persistUsers(latestUsers, nextUser.id);
    setActiveTab("home");
  }

  function createUser(name: string) {
    const safeName = name.trim() || `ผู้ใช้ ${users.length + 1}`;
    const latestUsers = getUsersWithCurrentData();
    const newUser = makeDefaultUser(safeName);
    const nextUsers = [...latestUsers, newUser];

    setUsers(nextUsers);
    setActiveUserId(newUser.id);
    loadUserData(newUser);
    persistUsers(nextUsers, newUser.id);
    setActiveTab("profiles");
  }

  function renameUser(userId: string, nextName: string) {
    const safeName = nextName.trim();
    if (!safeName) return;

    const latestUsers = getUsersWithCurrentData().map((user) =>
      user.id === userId
        ? {
            ...user,
            name: safeName,
            updatedAt: new Date().toISOString(),
          }
        : user
    );

    setUsers(latestUsers);
    persistUsers(latestUsers, activeUserId);
  }

  function deleteUser(userId: string) {
    const latestUsers = getUsersWithCurrentData();

    if (latestUsers.length <= 1) {
      window.alert("ต้องมีอย่างน้อย 1 โปรไฟล์");
      return;
    }

    const targetUser = latestUsers.find((user) => user.id === userId);
    const confirmDelete = window.confirm(
      `ต้องการลบโปรไฟล์ ${targetUser?.name ?? "นี้"} ใช่ไหม? ข้อมูลอาหารและออกกำลังกายของโปรไฟล์นี้จะถูกลบจากเครื่องนี้`
    );

    if (!confirmDelete) return;

    const nextUsers = latestUsers.filter((user) => user.id !== userId);
    const nextActiveUserId =
      userId === activeUserId ? nextUsers[0].id : activeUserId;
    const nextActiveUser =
      nextUsers.find((user) => user.id === nextActiveUserId) ?? nextUsers[0];

    setUsers(nextUsers);
    setActiveUserId(nextActiveUser.id);
    loadUserData(nextActiveUser);
    persistUsers(nextUsers, nextActiveUser.id);
  }

  function getAmount(food: Food) {
    return amountInputs[food.id] ?? food.baseAmount;
  }

  function setFoodAmount(foodId: string, amount: number) {
    setAmountInputs((prev) => ({
      ...prev,
      [foodId]: Math.max(0, amount),
    }));
  }

  function addFoodToDate(food: Food, mealType: string) {
    const amount = getAmount(food);
    const calculated = calcByAmount(food, amount);

    const newLog: MealLog = {
      id: crypto.randomUUID(),
      foodId: food.id,
      name: food.name,
      amount,
      unit: food.unit,
      baseAmount: food.baseAmount,
      calories: calculated.calories,
      protein: calculated.protein,
      carbs: calculated.carbs,
      fat: calculated.fat,
      mealType,
    };

    setDailyLogs((prev) => ({
      ...prev,
      [selectedDate]: [...(prev[selectedDate] ?? []), newLog],
    }));

    setActiveTab("home");
  }

  function deleteLog(logId: string) {
    setDailyLogs((prev) => ({
      ...prev,
      [selectedDate]: (prev[selectedDate] ?? []).filter(
        (item) => item.id !== logId
      ),
    }));
  }

  function updateLogAmount(logId: string, nextAmount: number) {
    setDailyLogs((prev) => {
      const nextLogs = (prev[selectedDate] ?? []).map((item) => {
        if (item.id !== logId) return item;

        const originalFood = foods.find((food) => food.id === item.foodId);

        if (!originalFood) {
          return {
            ...item,
            amount: nextAmount,
          };
        }

        const calculated = calcByAmount(originalFood, nextAmount);

        return {
          ...item,
          amount: nextAmount,
          ...calculated,
        };
      });

      return {
        ...prev,
        [selectedDate]: nextLogs,
      };
    });
  }

  function addWorkoutToDate(workout: Omit<WorkoutLog, "id">) {
    const newWorkout: WorkoutLog = {
      id: crypto.randomUUID(),
      ...workout,
    };

    setDailyWorkouts((prev) => ({
      ...prev,
      [selectedDate]: [...(prev[selectedDate] ?? []), newWorkout],
    }));
  }

  function deleteWorkout(workoutId: string) {
    setDailyWorkouts((prev) => ({
      ...prev,
      [selectedDate]: (prev[selectedDate] ?? []).filter(
        (item) => item.id !== workoutId
      ),
    }));
  }

  function clearDate() {
    setDailyLogs((prev) => ({
      ...prev,
      [selectedDate]: [],
    }));

    setDailyWorkouts((prev) => ({
      ...prev,
      [selectedDate]: [],
    }));
  }

  function addCustomFood(food: Food) {
    setFoods((prev) => [...prev, food]);
  }

  function deleteFood(foodId: string) {
    setFoods((prev) => prev.filter((food) => food.id !== foodId));
  }

  function applyRecommendedTargets() {
    setTargets(calculateRecommendedTargets(profile));
  }

  function resetAllData() {
    const confirmReset = window.confirm(
      `ต้องการล้างข้อมูลของโปรไฟล์ ${activeUserName} ใช่ไหม?`
    );

    if (!confirmReset) return;

    setProfile(defaultProfile);
    setTargets(defaultTargets);
    setFoods(defaultFoods);
    setDailyLogs({});
    setDailyWorkouts({});
    setAmountInputs({});
    setSelectedDate(todayString());
    setActiveTab("home");
  }

  return (
    <main className="min-h-screen bg-[#050807] text-white">
      <div className="mx-auto min-h-screen max-w-md px-5 pb-24 pt-6">
        {activeTab === "home" && (
          <Dashboard
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            totals={totals}
            targets={targets}
            logs={logsToday}
            workouts={workoutsToday}
            activeUserName={activeUserName}
            onAddFood={() => setActiveTab("add")}
            onGoWorkout={() => setActiveTab("workout")}
            onClearDate={clearDate}
            onDeleteLog={deleteLog}
            onUpdateLogAmount={updateLogAmount}
          />
        )}

        {activeTab === "add" && (
          <AddFood
            foods={foods}
            amountInputs={amountInputs}
            getAmount={getAmount}
            setFoodAmount={setFoodAmount}
            onAddFood={addFoodToDate}
          />
        )}

        {activeTab === "workout" && (
          <WorkoutPage
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            workouts={workoutsToday}
            onAddWorkout={addWorkoutToDate}
            onDeleteWorkout={deleteWorkout}
          />
        )}

        {activeTab === "database" && (
          <FoodDatabase
            foods={foods}
            onAddCustomFood={addCustomFood}
            onDeleteFood={deleteFood}
          />
        )}

        {activeTab === "history" && (
          <History
            historyDates={historyDates}
            dailyLogs={dailyLogs}
            dailyWorkouts={dailyWorkouts}
            targets={targets}
            setSelectedDate={setSelectedDate}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === "goals" && (
          <Goals
            profile={profile}
            setProfile={setProfile}
            targets={targets}
            setTargets={setTargets}
            recommendedTargets={calculateRecommendedTargets(profile)}
            onApplyRecommended={applyRecommendedTargets}
            onResetAllData={resetAllData}
          />
        )}

        {activeTab === "profiles" && (
          <ProfilesPage
            users={getUsersWithCurrentData()}
            activeUserId={activeUserId}
            currentProfile={profile}
            currentTargets={targets}
            currentDailyLogs={dailyLogs}
            currentDailyWorkouts={dailyWorkouts}
            onSwitchUser={switchUser}
            onCreateUser={createUser}
            onRenameUser={renameUser}
            onDeleteUser={deleteUser}
          />
        )}

        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </main>
  );
}

function Dashboard({
  selectedDate,
  setSelectedDate,
  totals,
  targets,
  logs,
  workouts,
  activeUserName,
  onAddFood,
  onGoWorkout,
  onClearDate,
  onDeleteLog,
  onUpdateLogAmount,
}: {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  totals: Targets;
  targets: Targets;
  logs: MealLog[];
  workouts: WorkoutLog[];
  activeUserName: string;
  onAddFood: () => void;
  onGoWorkout: () => void;
  onClearDate: () => void;
  onDeleteLog: (id: string) => void;
  onUpdateLogAmount: (id: string, amount: number) => void;
}) {
  const workoutCalories = getWorkoutCalories(workouts);

  return (
    <>
      <header className="mb-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 outline-none"
          />

          <button
            onClick={onClearDate}
            className="rounded-xl border border-zinc-800 px-3 py-2 text-xs text-zinc-300 active:scale-95"
          >
            ล้างวันนี้
          </button>
        </div>

        <h1 className="text-3xl font-bold tracking-tight">
          Macro<span className="text-green-500">Mate</span>
        </h1>

        <p className="mt-2 text-sm text-zinc-400">สรุปโภชนาการรายวัน</p>
        <p className="mt-1 text-xs text-green-400">โปรไฟล์: {activeUserName}</p>
      </header>

      <section className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-4 shadow-xl">
        <MacroRow
          label="แคลอรี่"
          current={totals.calories}
          target={targets.calories}
          unit="kcal"
          color="bg-orange-500"
        />

        <MacroRow
          label="โปรตีน"
          current={totals.protein}
          target={targets.protein}
          unit="g"
          color="bg-green-500"
        />

        <MacroRow
          label="คาร์บ"
          current={totals.carbs}
          target={targets.carbs}
          unit="g"
          color="bg-blue-500"
        />

        <MacroRow
          label="ไขมัน"
          current={totals.fat}
          target={targets.fat}
          unit="g"
          color="bg-yellow-400"
        />
      </section>

      <section className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">
          <p className="text-sm text-zinc-400">ออกกำลังกาย</p>
          <p className="mt-1 text-xl font-bold text-green-400">
            {workoutCalories} kcal
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {workouts.length} รายการวันนี้
          </p>
        </div>

        <button
          onClick={onGoWorkout}
          className="rounded-2xl border border-green-900/60 bg-green-950/30 p-4 text-left active:scale-[0.99]"
        >
          <p className="text-sm text-green-400">Training Log</p>
          <p className="mt-1 font-semibold">บันทึกออกกำลัง</p>
          <p className="mt-1 text-xs text-zinc-500">Push / Pull / Leg / Cardio</p>
        </button>
      </section>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">อาหารวันที่เลือก</h2>
          <p className="text-xs text-zinc-500">{logs.length} รายการ</p>
        </div>

        {logs.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-950/60 p-6 text-center text-zinc-400">
            ยังไม่มีอาหารในวันนี้
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((item) => (
              <MealCard
                key={item.id}
                item={item}
                onDelete={() => onDeleteLog(item.id)}
                onUpdateAmount={(amount) => onUpdateLogAmount(item.id, amount)}
              />
            ))}
          </div>
        )}
      </section>

      <button
        onClick={onAddFood}
        className="mt-6 w-full rounded-2xl bg-green-600 py-4 text-lg font-semibold text-white shadow-lg shadow-green-950/40 active:scale-[0.99]"
      >
        + เพิ่มอาหาร
      </button>
    </>
  );
}

function AddFood({
  foods,
  amountInputs,
  getAmount,
  setFoodAmount,
  onAddFood,
}: {
  foods: Food[];
  amountInputs: Record<string, number>;
  getAmount: (food: Food) => number;
  setFoodAmount: (foodId: string, amount: number) => void;
  onAddFood: (food: Food, mealType: string) => void;
}) {
  const [mealType, setMealType] = useState("กลางวัน");
  const [search, setSearch] = useState("");

  const filteredFoods = foods.filter((food) =>
    food.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <header className="mb-6">
        <p className="text-sm text-zinc-400">เลือกอาหารและใส่ปริมาณจริง</p>
        <h1 className="mt-2 text-2xl font-bold">เพิ่มอาหาร</h1>
      </header>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="ค้นหาอาหาร เช่น ข้าว, เวย์, ไข่"
        className="mb-4 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
      />

      <div className="mb-4 grid grid-cols-4 gap-2">
        {["เช้า", "กลางวัน", "เย็น", "ของว่าง"].map((meal) => (
          <button
            key={meal}
            onClick={() => setMealType(meal)}
            className={`rounded-xl border px-3 py-2 text-xs active:scale-95 ${
              mealType === meal
                ? "border-green-500 bg-green-600 text-white"
                : "border-zinc-800 bg-zinc-950 text-zinc-400"
            }`}
          >
            {meal}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredFoods.map((food) => {
          const amount = amountInputs[food.id] ?? food.baseAmount;
          const calculated = calcByAmount(food, amount);
          const step = food.unit === "g" ? 50 : 1;

          return (
            <div
              key={food.id}
              className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-4"
            >
              <div className="mb-3 flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">{food.name}</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    ค่าอ้างอิง {food.baseAmount} {food.unit} = {food.calories}{" "}
                    kcal
                  </p>
                </div>

                <button
                  onClick={() => onAddFood(food, mealType)}
                  className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold active:scale-95"
                >
                  เพิ่ม
                </button>
              </div>

              <div className="mb-3 flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  value={amount}
                  onChange={(e) =>
                    setFoodAmount(food.id, Number(e.target.value))
                  }
                  className="w-28 rounded-xl border border-zinc-800 bg-[#050807] px-3 py-2 text-sm outline-none"
                />

                <span className="text-sm text-zinc-400">{food.unit}</span>

                <button
                  onClick={() =>
                    setFoodAmount(food.id, Math.max(0, getAmount(food) - step))
                  }
                  className="ml-auto rounded-xl border border-zinc-800 px-3 py-2 text-sm active:scale-95"
                >
                  -{step}
                </button>

                <button
                  onClick={() => setFoodAmount(food.id, getAmount(food) + step)}
                  className="rounded-xl border border-zinc-800 px-3 py-2 text-sm active:scale-95"
                >
                  +{step}
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <MacroBadge label="kcal" value={calculated.calories} />
                <MacroBadge label="P" value={calculated.protein} />
                <MacroBadge label="C" value={calculated.carbs} />
                <MacroBadge label="F" value={calculated.fat} />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}


type MuscleKey =
  | "chest"
  | "frontShoulder"
  | "sideShoulder"
  | "rearShoulder"
  | "triceps"
  | "biceps"
  | "forearms"
  | "lats"
  | "traps"
  | "lowerBack"
  | "abs"
  | "obliques"
  | "quads"
  | "hamstrings"
  | "glutes"
  | "calves";

type MuscleActivation = {
  primary: MuscleKey[];
  secondary: MuscleKey[];
};

const muscleLabels: Record<MuscleKey, string> = {
  chest: "อก",
  frontShoulder: "ไหล่หน้า",
  sideShoulder: "ไหล่ข้าง",
  rearShoulder: "ไหล่หลัง",
  triceps: "หลังแขน",
  biceps: "หน้าแขน",
  forearms: "ปลายแขน",
  lats: "ปีก / หลังกลาง",
  traps: "บ่า / หลังบน",
  lowerBack: "หลังล่าง",
  abs: "หน้าท้อง / แกนกลาง",
  obliques: "เอวข้าง",
  quads: "หน้าขา",
  hamstrings: "หลังขา",
  glutes: "ก้น",
  calves: "น่อง",
};

const workoutActivationMap: Record<WorkoutType, MuscleActivation> = {
  push: {
    primary: ["chest", "frontShoulder", "sideShoulder", "triceps"],
    secondary: ["abs", "obliques"],
  },
  pull: {
    primary: ["lats", "traps", "rearShoulder", "biceps"],
    secondary: ["forearms", "lowerBack"],
  },
  leg: {
    primary: ["quads", "hamstrings", "glutes", "calves"],
    secondary: ["abs", "obliques", "lowerBack"],
  },
  chest: {
    primary: ["chest"],
    secondary: ["frontShoulder", "triceps", "abs"],
  },
  back: {
    primary: ["lats", "traps"],
    secondary: ["rearShoulder", "biceps", "forearms", "lowerBack"],
  },
  tricep: {
    primary: ["triceps"],
    secondary: ["frontShoulder"],
  },
  bicep: {
    primary: ["biceps"],
    secondary: ["forearms"],
  },
  shoulder: {
    primary: ["frontShoulder", "sideShoulder", "rearShoulder"],
    secondary: ["traps", "triceps"],
  },
  cardio: {
    primary: ["quads", "calves"],
    secondary: ["abs", "obliques", "glutes", "hamstrings"],
  },
  rest: {
    primary: [],
    secondary: [],
  },
  custom: {
    primary: [],
    secondary: [],
  },
};

function getMuscleState(types: WorkoutType[]) {
  const primary = new Set<MuscleKey>();
  const secondary = new Set<MuscleKey>();

  types.forEach((type) => {
    const config = workoutActivationMap[type];

    if (!config) return;

    config.primary.forEach((muscle) => primary.add(muscle));
    config.secondary.forEach((muscle) => {
      if (!primary.has(muscle)) secondary.add(muscle);
    });
  });

  primary.forEach((muscle) => secondary.delete(muscle));

  return {
    primary: Array.from(primary),
    secondary: Array.from(secondary),
  };
}

function MuscleMap({ selectedTypes }: { selectedTypes: WorkoutType[] }) {
  const { primary, secondary } = getMuscleState(selectedTypes);
  const allActive = [...primary, ...secondary];

  function muscleFill(muscle: MuscleKey) {
    if (primary.includes(muscle)) return "#ef4444";
    if (secondary.includes(muscle)) return "#facc15";
    return "#2f2f38";
  }

  function muscleStroke(muscle: MuscleKey) {
    if (primary.includes(muscle)) return "#fca5a5";
    if (secondary.includes(muscle)) return "#fde047";
    return "#4b5563";
  }

  function isActive(muscle: MuscleKey) {
    return primary.includes(muscle) || secondary.includes(muscle);
  }

  const selectedLabel = selectedTypes
    .map((type) => workoutOptions.find((item) => item.type === type)?.label)
    .filter(Boolean)
    .join(" + ");

  return (
    <section className="mb-4 overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-950 via-[#070b0a] to-[#020403]">
      <div className="border-b border-zinc-800/80 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white">Muscle Map</h3>
            <p className="mt-1 text-xs text-zinc-400">
              {selectedLabel || "เลือกประเภทการออกกำลังกาย"}
            </p>
          </div>

          <div className="rounded-full border border-green-900/60 bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">
            {allActive.length} ส่วน
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-red-300">
            ● กล้ามเนื้อหลัก
          </span>
          <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-yellow-300">
            ● กล้ามเนื้อรอง
          </span>
          <span className="rounded-full border border-zinc-700 bg-zinc-800/60 px-3 py-1 text-zinc-400">
            ● ไม่ใช่เป้าหมาย
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="rounded-[28px] border border-zinc-800 bg-[#0b0d0c] p-3 shadow-2xl shadow-black/40">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-3xl border border-zinc-800 bg-[#111312] p-2">
              <p className="mb-1 text-center text-xs font-semibold text-zinc-400">
                FRONT
              </p>

              <svg viewBox="0 0 220 430" className="h-[330px] w-full">
                <defs>
                  <filter id="glowFront" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <path
                  d="M110 10 C96 10 86 21 86 36 C86 50 95 61 110 61 C125 61 134 50 134 36 C134 21 124 10 110 10Z"
                  fill="#111827"
                  stroke="#9ca3af"
                  strokeWidth="3"
                />
                <path
                  d="M87 62 C76 69 68 79 63 95 C53 101 44 116 39 140 L31 190 C28 204 34 213 42 208 L56 157 L61 188 C63 207 70 229 82 250 L88 292 L82 384 C79 401 90 406 98 391 L110 310 L122 391 C130 406 141 401 138 384 L132 292 L138 250 C150 229 157 207 159 188 L164 157 L178 208 C186 213 192 204 189 190 L181 140 C176 116 167 101 157 95 C152 79 144 69 133 62 Z"
                  fill="#101214"
                  stroke="#6b7280"
                  strokeWidth="3"
                />

                <path
                  d="M78 88 C86 71 101 70 109 90 L109 139 C92 139 81 128 76 111 C73 101 74 94 78 88Z"
                  fill={muscleFill("chest")}
                  stroke={muscleStroke("chest")}
                  strokeWidth="2.5"
                  filter={isActive("chest") ? "url(#glowFront)" : undefined}
                />
                <path
                  d="M142 88 C134 71 119 70 111 90 L111 139 C128 139 139 128 144 111 C147 101 146 94 142 88Z"
                  fill={muscleFill("chest")}
                  stroke={muscleStroke("chest")}
                  strokeWidth="2.5"
                  filter={isActive("chest") ? "url(#glowFront)" : undefined}
                />

                <path
                  d="M66 96 C69 82 78 73 89 72 C90 90 84 104 70 113 C66 108 64 102 66 96Z"
                  fill={muscleFill("frontShoulder")}
                  stroke={muscleStroke("frontShoulder")}
                  strokeWidth="2.5"
                  filter={isActive("frontShoulder") ? "url(#glowFront)" : undefined}
                />
                <path
                  d="M154 96 C151 82 142 73 131 72 C130 90 136 104 150 113 C154 108 156 102 154 96Z"
                  fill={muscleFill("frontShoulder")}
                  stroke={muscleStroke("frontShoulder")}
                  strokeWidth="2.5"
                  filter={isActive("frontShoulder") ? "url(#glowFront)" : undefined}
                />

                <ellipse
                  cx="58"
                  cy="121"
                  rx="15"
                  ry="31"
                  fill={muscleFill("sideShoulder")}
                  stroke={muscleStroke("sideShoulder")}
                  strokeWidth="2.5"
                  filter={isActive("sideShoulder") ? "url(#glowFront)" : undefined}
                />
                <ellipse
                  cx="162"
                  cy="121"
                  rx="15"
                  ry="31"
                  fill={muscleFill("sideShoulder")}
                  stroke={muscleStroke("sideShoulder")}
                  strokeWidth="2.5"
                  filter={isActive("sideShoulder") ? "url(#glowFront)" : undefined}
                />

                <rect
                  x="94"
                  y="143"
                  width="32"
                  height="72"
                  rx="15"
                  fill={muscleFill("abs")}
                  stroke={muscleStroke("abs")}
                  strokeWidth="2.5"
                  filter={isActive("abs") ? "url(#glowFront)" : undefined}
                />
                <line x1="110" y1="148" x2="110" y2="210" stroke="#090b0a" strokeWidth="2" />
                <line x1="97" y1="164" x2="123" y2="164" stroke="#090b0a" strokeWidth="2" />
                <line x1="97" y1="184" x2="123" y2="184" stroke="#090b0a" strokeWidth="2" />
                <line x1="97" y1="202" x2="123" y2="202" stroke="#090b0a" strokeWidth="2" />

                <path
                  d="M80 145 C75 164 76 195 90 220 L95 213 L94 147Z"
                  fill={muscleFill("obliques")}
                  stroke={muscleStroke("obliques")}
                  strokeWidth="2.5"
                  filter={isActive("obliques") ? "url(#glowFront)" : undefined}
                />
                <path
                  d="M140 145 C145 164 144 195 130 220 L125 213 L126 147Z"
                  fill={muscleFill("obliques")}
                  stroke={muscleStroke("obliques")}
                  strokeWidth="2.5"
                  filter={isActive("obliques") ? "url(#glowFront)" : undefined}
                />

                <ellipse
                  cx="50"
                  cy="168"
                  rx="10"
                  ry="35"
                  fill={muscleFill("biceps")}
                  stroke={muscleStroke("biceps")}
                  strokeWidth="2.5"
                  filter={isActive("biceps") ? "url(#glowFront)" : undefined}
                />
                <ellipse
                  cx="170"
                  cy="168"
                  rx="10"
                  ry="35"
                  fill={muscleFill("biceps")}
                  stroke={muscleStroke("biceps")}
                  strokeWidth="2.5"
                  filter={isActive("biceps") ? "url(#glowFront)" : undefined}
                />

                <path
                  d="M60 149 C51 164 51 190 60 207"
                  fill="none"
                  stroke={muscleFill("triceps")}
                  strokeWidth="8"
                  strokeLinecap="round"
                  filter={isActive("triceps") ? "url(#glowFront)" : undefined}
                />
                <path
                  d="M160 149 C169 164 169 190 160 207"
                  fill="none"
                  stroke={muscleFill("triceps")}
                  strokeWidth="8"
                  strokeLinecap="round"
                  filter={isActive("triceps") ? "url(#glowFront)" : undefined}
                />

                <ellipse
                  cx="43"
                  cy="230"
                  rx="10"
                  ry="34"
                  fill={muscleFill("forearms")}
                  stroke={muscleStroke("forearms")}
                  strokeWidth="2.5"
                  filter={isActive("forearms") ? "url(#glowFront)" : undefined}
                />
                <ellipse
                  cx="177"
                  cy="230"
                  rx="10"
                  ry="34"
                  fill={muscleFill("forearms")}
                  stroke={muscleStroke("forearms")}
                  strokeWidth="2.5"
                  filter={isActive("forearms") ? "url(#glowFront)" : undefined}
                />

                <path
                  d="M87 250 C104 242 109 271 103 333 C84 329 76 285 87 250Z"
                  fill={muscleFill("quads")}
                  stroke={muscleStroke("quads")}
                  strokeWidth="2.5"
                  filter={isActive("quads") ? "url(#glowFront)" : undefined}
                />
                <path
                  d="M133 250 C116 242 111 271 117 333 C136 329 144 285 133 250Z"
                  fill={muscleFill("quads")}
                  stroke={muscleStroke("quads")}
                  strokeWidth="2.5"
                  filter={isActive("quads") ? "url(#glowFront)" : undefined}
                />

                <path
                  d="M92 334 C78 355 80 395 94 405 C108 383 106 352 92 334Z"
                  fill={muscleFill("calves")}
                  stroke={muscleStroke("calves")}
                  strokeWidth="2.5"
                  filter={isActive("calves") ? "url(#glowFront)" : undefined}
                />
                <path
                  d="M128 334 C142 355 140 395 126 405 C112 383 114 352 128 334Z"
                  fill={muscleFill("calves")}
                  stroke={muscleStroke("calves")}
                  strokeWidth="2.5"
                  filter={isActive("calves") ? "url(#glowFront)" : undefined}
                />
              </svg>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-[#111312] p-2">
              <p className="mb-1 text-center text-xs font-semibold text-zinc-400">
                BACK
              </p>

              <svg viewBox="0 0 220 430" className="h-[330px] w-full">
                <defs>
                  <filter id="glowBack" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <path
                  d="M110 10 C96 10 86 21 86 36 C86 50 95 61 110 61 C125 61 134 50 134 36 C134 21 124 10 110 10Z"
                  fill="#111827"
                  stroke="#9ca3af"
                  strokeWidth="3"
                />
                <path
                  d="M87 62 C76 69 68 79 63 95 C53 101 44 116 39 140 L31 190 C28 204 34 213 42 208 L56 157 L61 188 C63 207 70 229 82 250 L88 292 L82 384 C79 401 90 406 98 391 L110 310 L122 391 C130 406 141 401 138 384 L132 292 L138 250 C150 229 157 207 159 188 L164 157 L178 208 C186 213 192 204 189 190 L181 140 C176 116 167 101 157 95 C152 79 144 69 133 62 Z"
                  fill="#101214"
                  stroke="#6b7280"
                  strokeWidth="3"
                />

                <path
                  d="M88 64 L110 94 L132 64 C136 82 137 103 130 119 L110 136 L90 119 C83 103 84 82 88 64Z"
                  fill={muscleFill("traps")}
                  stroke={muscleStroke("traps")}
                  strokeWidth="2.5"
                  filter={isActive("traps") ? "url(#glowBack)" : undefined}
                />

                <path
                  d="M65 95 C70 75 86 70 99 77 C95 94 85 112 70 119 C65 113 63 104 65 95Z"
                  fill={muscleFill("rearShoulder")}
                  stroke={muscleStroke("rearShoulder")}
                  strokeWidth="2.5"
                  filter={isActive("rearShoulder") ? "url(#glowBack)" : undefined}
                />
                <path
                  d="M155 95 C150 75 134 70 121 77 C125 94 135 112 150 119 C155 113 157 104 155 95Z"
                  fill={muscleFill("rearShoulder")}
                  stroke={muscleStroke("rearShoulder")}
                  strokeWidth="2.5"
                  filter={isActive("rearShoulder") ? "url(#glowBack)" : undefined}
                />

                <ellipse
                  cx="58"
                  cy="121"
                  rx="15"
                  ry="31"
                  fill={muscleFill("sideShoulder")}
                  stroke={muscleStroke("sideShoulder")}
                  strokeWidth="2.5"
                  filter={isActive("sideShoulder") ? "url(#glowBack)" : undefined}
                />
                <ellipse
                  cx="162"
                  cy="121"
                  rx="15"
                  ry="31"
                  fill={muscleFill("sideShoulder")}
                  stroke={muscleStroke("sideShoulder")}
                  strokeWidth="2.5"
                  filter={isActive("sideShoulder") ? "url(#glowBack)" : undefined}
                />

                <path
                  d="M78 113 C60 135 63 178 88 213 L105 184 L104 119Z"
                  fill={muscleFill("lats")}
                  stroke={muscleStroke("lats")}
                  strokeWidth="2.5"
                  filter={isActive("lats") ? "url(#glowBack)" : undefined}
                />
                <path
                  d="M142 113 C160 135 157 178 132 213 L115 184 L116 119Z"
                  fill={muscleFill("lats")}
                  stroke={muscleStroke("lats")}
                  strokeWidth="2.5"
                  filter={isActive("lats") ? "url(#glowBack)" : undefined}
                />

                <path
                  d="M96 184 L124 184 L132 225 L88 225 Z"
                  fill={muscleFill("lowerBack")}
                  stroke={muscleStroke("lowerBack")}
                  strokeWidth="2.5"
                  filter={isActive("lowerBack") ? "url(#glowBack)" : undefined}
                />

                <ellipse
                  cx="50"
                  cy="168"
                  rx="10"
                  ry="35"
                  fill={muscleFill("triceps")}
                  stroke={muscleStroke("triceps")}
                  strokeWidth="2.5"
                  filter={isActive("triceps") ? "url(#glowBack)" : undefined}
                />
                <ellipse
                  cx="170"
                  cy="168"
                  rx="10"
                  ry="35"
                  fill={muscleFill("triceps")}
                  stroke={muscleStroke("triceps")}
                  strokeWidth="2.5"
                  filter={isActive("triceps") ? "url(#glowBack)" : undefined}
                />

                <path
                  d="M61 148 C52 164 52 190 61 207"
                  fill="none"
                  stroke={muscleFill("biceps")}
                  strokeWidth="7"
                  strokeLinecap="round"
                  filter={isActive("biceps") ? "url(#glowBack)" : undefined}
                />
                <path
                  d="M159 148 C168 164 168 190 159 207"
                  fill="none"
                  stroke={muscleFill("biceps")}
                  strokeWidth="7"
                  strokeLinecap="round"
                  filter={isActive("biceps") ? "url(#glowBack)" : undefined}
                />

                <ellipse
                  cx="43"
                  cy="230"
                  rx="10"
                  ry="34"
                  fill={muscleFill("forearms")}
                  stroke={muscleStroke("forearms")}
                  strokeWidth="2.5"
                  filter={isActive("forearms") ? "url(#glowBack)" : undefined}
                />
                <ellipse
                  cx="177"
                  cy="230"
                  rx="10"
                  ry="34"
                  fill={muscleFill("forearms")}
                  stroke={muscleStroke("forearms")}
                  strokeWidth="2.5"
                  filter={isActive("forearms") ? "url(#glowBack)" : undefined}
                />

                <ellipse
                  cx="97"
                  cy="250"
                  rx="19"
                  ry="24"
                  fill={muscleFill("glutes")}
                  stroke={muscleStroke("glutes")}
                  strokeWidth="2.5"
                  filter={isActive("glutes") ? "url(#glowBack)" : undefined}
                />
                <ellipse
                  cx="123"
                  cy="250"
                  rx="19"
                  ry="24"
                  fill={muscleFill("glutes")}
                  stroke={muscleStroke("glutes")}
                  strokeWidth="2.5"
                  filter={isActive("glutes") ? "url(#glowBack)" : undefined}
                />

                <path
                  d="M91 272 C107 280 106 320 96 352 C80 343 78 294 91 272Z"
                  fill={muscleFill("hamstrings")}
                  stroke={muscleStroke("hamstrings")}
                  strokeWidth="2.5"
                  filter={isActive("hamstrings") ? "url(#glowBack)" : undefined}
                />
                <path
                  d="M129 272 C113 280 114 320 124 352 C140 343 142 294 129 272Z"
                  fill={muscleFill("hamstrings")}
                  stroke={muscleStroke("hamstrings")}
                  strokeWidth="2.5"
                  filter={isActive("hamstrings") ? "url(#glowBack)" : undefined}
                />

                <path
                  d="M92 334 C78 355 80 395 94 405 C108 383 106 352 92 334Z"
                  fill={muscleFill("calves")}
                  stroke={muscleStroke("calves")}
                  strokeWidth="2.5"
                  filter={isActive("calves") ? "url(#glowBack)" : undefined}
                />
                <path
                  d="M128 334 C142 355 140 395 126 405 C112 383 114 352 128 334Z"
                  fill={muscleFill("calves")}
                  stroke={muscleStroke("calves")}
                  strokeWidth="2.5"
                  filter={isActive("calves") ? "url(#glowBack)" : undefined}
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-red-900/40 bg-red-950/10 p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-semibold text-red-300">กล้ามเนื้อหลัก</p>
              <span className="rounded-full bg-red-500/10 px-2 py-1 text-xs text-red-300">
                {primary.length}
              </span>
            </div>

            {primary.length === 0 ? (
              <p className="text-xs text-zinc-500">ไม่มี</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {primary.map((muscle) => (
                  <span
                    key={muscle}
                    className="rounded-full bg-red-500/10 px-3 py-1 text-xs text-red-200"
                  >
                    {muscleLabels[muscle]}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-yellow-900/40 bg-yellow-950/10 p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-semibold text-yellow-300">กล้ามเนื้อรอง</p>
              <span className="rounded-full bg-yellow-500/10 px-2 py-1 text-xs text-yellow-300">
                {secondary.length}
              </span>
            </div>

            {secondary.length === 0 ? (
              <p className="text-xs text-zinc-500">ไม่มี</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {secondary.map((muscle) => (
                  <span
                    key={muscle}
                    className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs text-yellow-100"
                  >
                    {muscleLabels[muscle]}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-[#050807] p-3 text-xs leading-6 text-zinc-400">
          <p className="font-semibold text-zinc-300">แนวทางการอ่านสี</p>
          <p className="mt-1">
            <span className="text-red-300">แดง</span> = กล้ามเนื้อหลักที่ควรได้โหลดเยอะ
          </p>
          <p>
            <span className="text-yellow-300">เหลือง</span> = กล้ามเนื้อรองที่ช่วยทำงาน
          </p>
          <p>
            <span className="text-zinc-400">เทา</span> = ไม่ใช่เป้าหมายหลักของวันนี้
          </p>
        </div>
      </div>
    </section>
  );
}

function WorkoutPage({
  selectedDate,
  setSelectedDate,
  workouts,
  onAddWorkout,
  onDeleteWorkout,
}: {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  workouts: WorkoutLog[];
  onAddWorkout: (workout: Omit<WorkoutLog, "id">) => void;
  onDeleteWorkout: (id: string) => void;
}) {
  const [selectedTypes, setSelectedTypes] = useState<WorkoutType[]>(["push"]);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [intensity, setIntensity] = useState<WorkoutIntensity>("moderate");
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [notes, setNotes] = useState("");

  const totalWorkoutCalories = getWorkoutCalories(workouts);

  function toggleWorkoutType(type: WorkoutType) {
    setSelectedTypes((prev) => {
      if (type === "rest") {
        return ["rest"];
      }

      const withoutRest = prev.filter((item) => item !== "rest");

      if (withoutRest.includes(type)) {
        const next = withoutRest.filter((item) => item !== type);
        return next.length > 0 ? next : withoutRest;
      }

      return [...withoutRest, type];
    });
  }

  function estimateCalories() {
    if (selectedTypes.includes("rest")) return 0;

    const basePerMinute =
      intensity === "light" ? 4 : intensity === "moderate" ? 6 : 8;

    const hasCardio = selectedTypes.includes("cardio");
    const cardioBonus = hasCardio ? 2 : 0;

    return Math.round(durationMinutes * (basePerMinute + cardioBonus));
  }

  function useEstimatedCalories() {
    setCaloriesBurned(estimateCalories());
  }

  function submitWorkout() {
    const label = selectedTypes
      .map((type) => workoutOptions.find((item) => item.type === type)?.label)
      .filter(Boolean)
      .join(" + ");

    onAddWorkout({
      types: selectedTypes,
      label: label || "Workout",
      durationMinutes,
      intensity,
      caloriesBurned: caloriesBurned || estimateCalories(),
      caloriesSource: "manual",
      notes,
    });

    setNotes("");
    setCaloriesBurned(0);
  }

  return (
    <>
      <header className="mb-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 outline-none"
          />
        </div>

        <p className="text-sm text-zinc-400">Training Log</p>
        <h1 className="mt-2 text-2xl font-bold">ออกกำลังกาย</h1>
      </header>

      <section className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-4">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold">บันทึกการออกกำลังกาย</h2>
            <p className="mt-1 text-xs text-zinc-500">
              เลือกได้หลายกลุ่ม เช่น Chest + Tricep + Cardio
            </p>
          </div>

          <div className="text-right text-sm">
            <p className="font-semibold text-green-400">
              {totalWorkoutCalories} kcal
            </p>
            <p className="text-xs text-zinc-500">รวมที่เผาผลาญวันนี้</p>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-2">
          {workoutOptions.map((item) => {
            const active = selectedTypes.includes(item.type);

            return (
              <button
                key={item.type}
                onClick={() => toggleWorkoutType(item.type)}
                className={`rounded-xl border px-3 py-2 text-xs active:scale-95 ${
                  active
                    ? "border-green-500 bg-green-600 text-white"
                    : "border-zinc-800 bg-[#050807] text-zinc-400"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <MuscleMap selectedTypes={selectedTypes} />

        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label="เวลา นาที"
            value={durationMinutes}
            onChange={setDurationMinutes}
          />

          <label className="mb-3 block">
            <span className="text-sm text-zinc-400">ความหนัก</span>

            <select
              value={intensity}
              onChange={(e) => setIntensity(e.target.value as WorkoutIntensity)}
              className="mt-1 w-full rounded-xl border border-zinc-800 bg-[#050807] px-3 py-3 text-sm outline-none"
            >
              <option value="light">เบา</option>
              <option value="moderate">ปานกลาง</option>
              <option value="hard">หนัก</option>
            </select>
          </label>
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-3">
          <NumberInput
            label="แคลอรี่ที่เผาผลาญ"
            value={caloriesBurned}
            onChange={setCaloriesBurned}
          />

          <button
            onClick={useEstimatedCalories}
            className="mb-3 mt-6 rounded-xl border border-zinc-800 px-3 py-2 text-xs text-zinc-300 active:scale-95"
          >
            ใช้ค่าประมาณ
          </button>
        </div>

        <Input
          label="โน้ต เช่น อก+ไหล่+หลังแขน / เดินชัน 45 นาที"
          value={notes}
          onChange={setNotes}
        />

        <div className="mb-4 rounded-2xl border border-blue-900/40 bg-blue-950/20 p-3 text-xs leading-5 text-zinc-400">
          <p className="font-semibold text-blue-300">Smartwatch Sync Ready</p>
          <p className="mt-1">
            ตอนนี้ยังบันทึกแบบ manual ก่อน แต่โครงสร้างข้อมูลเตรียมไว้สำหรับ
            Apple Health, Garmin, Fitbit, Huawei Health และ Samsung Health แล้ว
          </p>
        </div>

        <button
          onClick={submitWorkout}
          className="w-full rounded-2xl bg-green-600 py-3 font-semibold active:scale-95"
        >
          บันทึกการออกกำลังกาย
        </button>
      </section>

      <section className="mt-4 rounded-3xl border border-zinc-800 bg-zinc-950/80 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">รายการวันนี้</h2>
          <p className="text-xs text-zinc-500">{workouts.length} รายการ</p>
        </div>

        {workouts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-4 text-center text-sm text-zinc-500">
            ยังไม่มีบันทึกออกกำลังกาย
          </div>
        ) : (
          <div className="space-y-2">
            {workouts.map((workout) => (
              <div
                key={workout.id}
                className="flex items-center justify-between rounded-2xl bg-[#050807] p-3"
              >
                <div>
                  <p className="font-medium">{workout.label}</p>

                  <p className="text-xs text-zinc-500">
                    {workout.durationMinutes} นาที · {workout.intensity}
                    {workout.notes ? ` · ${workout.notes}` : ""}
                  </p>

                  <p className="mt-1 text-xs text-blue-400">
                    source: {workout.caloriesSource}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm text-green-400">
                    {workout.caloriesBurned ?? 0} kcal
                  </p>

                  <button
                    onClick={() => onDeleteWorkout(workout.id)}
                    className="mt-1 text-xs text-red-400"
                  >
                    ลบ
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function FoodDatabase({
  foods,
  onAddCustomFood,
  onDeleteFood,
}: {
  foods: Food[];
  onAddCustomFood: (food: Food) => void;
  onDeleteFood: (foodId: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [agentQuery, setAgentQuery] = useState("");
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentResults, setAgentResults] = useState<Food[]>([]);
  const [agentMessage, setAgentMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    baseAmount: 100,
    unit: "g",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  function submitFood() {
    if (!form.name.trim()) return;

    onAddCustomFood({
      id: crypto.randomUUID(),
      name: form.name.trim(),
      baseAmount: Number(form.baseAmount),
      unit: form.unit.trim() || "g",
      calories: Number(form.calories),
      protein: Number(form.protein),
      carbs: Number(form.carbs),
      fat: Number(form.fat),
      source: "manual",
      confidence: "medium",
      verified: false,
      notes: "ผู้ใช้เพิ่มเอง",
    });

    setForm({
      name: "",
      baseAmount: 100,
      unit: "g",
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    });

    setShowForm(false);
  }

  async function searchFoodAgent() {
    if (agentQuery.trim().length < 2) {
      setAgentMessage("กรุณาใส่คำค้นหาอย่างน้อย 2 ตัวอักษร");
      return;
    }

    setAgentLoading(true);
    setAgentMessage("");
    setAgentResults([]);

    try {
      const res = await fetch(
        `/api/food-search?q=${encodeURIComponent(agentQuery)}`
      );

      const data = await res.json();

      if (!data.ok) {
        setAgentMessage(data.message ?? "ค้นหาไม่สำเร็จ");
        return;
      }

      const mapped: Food[] = (data.results ?? []).map((item: any) => ({
        id: crypto.randomUUID(),
        name: item.brand ? `${item.name}` : item.name,
        baseAmount: Number(item.baseAmount) || 100,
        unit: item.unit || "g",
        calories: Number(item.calories) || 0,
        protein: Number(item.protein) || 0,
        carbs: Number(item.carbs) || 0,
        fat: Number(item.fat) || 0,
        source: item.source ?? "open_food_facts",
        confidence: item.confidence ?? "low",
        verified: Boolean(item.verified),
        sourceUrl: item.sourceUrl,
        notes: item.notes,
        brand: item.brand,
      }));

      setAgentResults(mapped);
      setAgentMessage(data.message ?? `พบ ${mapped.length} รายการ`);
    } catch (error) {
      setAgentMessage(
        error instanceof Error
          ? `ค้นหาไม่สำเร็จ: ${error.message}`
          : "ค้นหาไม่สำเร็จ"
      );
    } finally {
      setAgentLoading(false);
    }
  }

  return (
    <>
      <header className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-sm text-zinc-400">อาหารทั้งหมด</p>
          <h1 className="mt-2 text-2xl font-bold">ฐานข้อมูลอาหาร</h1>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold active:scale-95"
        >
          + อาหารใหม่
        </button>
      </header>

      <section className="mb-4 rounded-3xl border border-green-900/60 bg-green-950/20 p-4">
        <h2 className="font-semibold text-green-400">Food Data Agent</h2>

        <p className="mt-1 text-xs text-zinc-400">
          ค้นหาจาก Open Food Facts แล้วให้ระบบประเมินความน่าเชื่อถือก่อนบันทึก
        </p>

        <div className="mt-3 flex gap-2">
          <input
            value={agentQuery}
            onChange={(e) => setAgentQuery(e.target.value)}
            placeholder="เช่น tuna, beef, whey, greek yogurt"
            className="min-w-0 flex-1 rounded-xl border border-zinc-800 bg-[#050807] px-3 py-3 text-sm outline-none placeholder:text-zinc-600"
          />

          <button
            onClick={searchFoodAgent}
            disabled={agentLoading}
            className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            {agentLoading ? "ค้นหา..." : "ค้นหา"}
          </button>
        </div>

        {agentMessage && (
          <p className="mt-2 text-xs text-zinc-400">{agentMessage}</p>
        )}

        {agentResults.length > 0 && (
          <div className="mt-4 space-y-3">
            {agentResults.map((food) => (
              <div
                key={food.id}
                className="rounded-2xl border border-zinc-800 bg-[#050807] p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{food.name}</p>

                    <p className="mt-1 text-xs text-zinc-500">
                      {food.baseAmount} {food.unit} · {food.calories} kcal
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-green-500/10 px-2 py-1 text-green-400">
                        P {food.protein}g
                      </span>

                      <span className="rounded-full bg-blue-500/10 px-2 py-1 text-blue-400">
                        C {food.carbs}g
                      </span>

                      <span className="rounded-full bg-yellow-500/10 px-2 py-1 text-yellow-400">
                        F {food.fat}g
                      </span>
                    </div>

                    <p
                      className={`mt-2 text-xs ${
                        food.confidence === "high"
                          ? "text-green-400"
                          : food.confidence === "medium"
                          ? "text-yellow-400"
                          : "text-red-400"
                      }`}
                    >
                      Confidence: {food.confidence}
                      {food.verified ? " · verified" : " · review needed"}
                    </p>

                    {food.notes && (
                      <p className="mt-1 text-xs text-zinc-500">
                        {food.notes}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => onAddCustomFood(food)}
                    className="rounded-xl bg-green-600 px-3 py-2 text-xs font-semibold active:scale-95"
                  >
                    บันทึก
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {showForm && (
        <div className="mb-4 rounded-3xl border border-zinc-800 bg-zinc-950/80 p-4">
          <h2 className="mb-3 font-semibold">เพิ่มอาหารเอง</h2>

          <Input
            label="ชื่ออาหาร"
            value={form.name}
            onChange={(value) => setForm({ ...form, name: value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <NumberInput
              label="ปริมาณอ้างอิง"
              value={form.baseAmount}
              onChange={(value) => setForm({ ...form, baseAmount: value })}
            />

            <Input
              label="หน่วย เช่น g, ฟอง, scoop"
              value={form.unit}
              onChange={(value) => setForm({ ...form, unit: value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <NumberInput
              label="แคลอรี่"
              value={form.calories}
              onChange={(value) => setForm({ ...form, calories: value })}
            />

            <NumberInput
              label="โปรตีน"
              value={form.protein}
              onChange={(value) => setForm({ ...form, protein: value })}
            />

            <NumberInput
              label="คาร์บ"
              value={form.carbs}
              onChange={(value) => setForm({ ...form, carbs: value })}
            />

            <NumberInput
              label="ไขมัน"
              value={form.fat}
              onChange={(value) => setForm({ ...form, fat: value })}
            />
          </div>

          <button
            onClick={submitFood}
            className="mt-3 w-full rounded-2xl bg-green-600 py-3 font-semibold active:scale-95"
          >
            บันทึกอาหารใหม่
          </button>
        </div>
      )}

      <div className="space-y-3">
        {foods.map((food) => (
          <div
            key={food.id}
            className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-4"
          >
            <div className="flex justify-between gap-4">
              <div>
                <p className="font-semibold">{food.name}</p>

                <p className="mt-1 text-sm text-zinc-400">
                  {food.baseAmount} {food.unit} · {food.calories} kcal
                </p>

                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-green-500/10 px-2 py-1 text-green-400">
                    {food.source ?? "manual"}
                  </span>

                  <span
                    className={`rounded-full px-2 py-1 ${
                      food.confidence === "high"
                        ? "bg-green-500/10 text-green-400"
                        : food.confidence === "medium"
                        ? "bg-yellow-500/10 text-yellow-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {food.confidence ?? "medium"}
                  </span>

                  {food.verified && (
                    <span className="rounded-full bg-blue-500/10 px-2 py-1 text-blue-400">
                      verified
                    </span>
                  )}
                </div>

                {!defaultFoods.some((item) => item.id === food.id) && (
                  <button
                    onClick={() => onDeleteFood(food.id)}
                    className="mt-3 rounded-xl border border-red-900/60 px-3 py-1 text-xs text-red-400 active:scale-95"
                  >
                    ลบอาหารนี้
                  </button>
                )}
              </div>

              <div className="text-right text-sm">
                <p className="text-green-400">P {food.protein}g</p>
                <p className="text-blue-400">C {food.carbs}g</p>
                <p className="text-yellow-400">F {food.fat}g</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function History({
  historyDates,
  dailyLogs,
  dailyWorkouts,
  targets,
  setSelectedDate,
  setActiveTab,
}: {
  historyDates: string[];
  dailyLogs: DailyLogs;
  dailyWorkouts: DailyWorkouts;
  targets: Targets;
  setSelectedDate: (date: string) => void;
  setActiveTab: (tab: Tab) => void;
}) {
  const [calendarMonth, setCalendarMonth] = useState(
    getMonthStart(todayString())
  );
  const [focusedDate, setFocusedDate] = useState(todayString());

  const calendarDays = getCalendarDays(calendarMonth);
  const focusedLogs = dailyLogs[focusedDate] ?? [];
  const focusedWorkouts = dailyWorkouts[focusedDate] ?? [];
  const focusedTotals = getTotalsFromLogs(focusedLogs);

  const hasFocusedLog = focusedLogs.length > 0;
  const hasWorkout = focusedWorkouts.length > 0;
  const proteinDone = focusedTotals.protein >= targets.protein;
  const caloriesMin = targets.calories * 0.9;
  const caloriesMax = targets.calories * 1.05;
  const caloriesInRange =
    focusedTotals.calories >= caloriesMin &&
    focusedTotals.calories <= caloriesMax;

  const fatNotOver = focusedTotals.fat <= targets.fat;
  const carbsNotOver = focusedTotals.carbs <= targets.carbs;

  const completedCount = [
    hasFocusedLog,
    hasWorkout,
    proteinDone,
    caloriesInRange,
    fatNotOver,
    carbsNotOver,
  ].filter(Boolean).length;

  function goPrevMonth() {
    setCalendarMonth(
      new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1)
    );
  }

  function goNextMonth() {
    setCalendarMonth(
      new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1)
    );
  }

  function goToday() {
    const today = todayString();
    setFocusedDate(today);
    setCalendarMonth(getMonthStart(today));
  }

  function openFocusedDate() {
    setSelectedDate(focusedDate);
    setActiveTab("home");
  }

  return (
    <>
      <header className="mb-6">
        <p className="text-sm text-zinc-400">Calendar + Daily Checklist</p>
        <h1 className="mt-2 text-2xl font-bold">ย้อนหลัง</h1>
      </header>

      <section className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <button
            onClick={goPrevMonth}
            className="rounded-xl border border-zinc-800 px-3 py-2 text-sm active:scale-95"
          >
            ‹
          </button>

          <div className="text-center">
            <p className="font-semibold">{formatMonthTitle(calendarMonth)}</p>

            <button onClick={goToday} className="mt-1 text-xs text-green-400">
              กลับไปวันนี้
            </button>
          </div>

          <button
            onClick={goNextMonth}
            className="rounded-xl border border-zinc-800 px-3 py-2 text-sm active:scale-95"
          >
            ›
          </button>
        </div>

        <div className="mb-2 grid grid-cols-7 text-center text-xs text-zinc-500">
          {["จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"].map((day) => (
            <div key={day} className="py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day) => {
            const logs = dailyLogs[day.dateString] ?? [];
            const workouts = dailyWorkouts[day.dateString] ?? [];
            const totals = getTotalsFromLogs(logs);

            const hasLog = logs.length > 0;
            const hasWorkoutDay = workouts.length > 0;
            const isFocused = day.dateString === focusedDate;
            const isToday = day.dateString === todayString();
            const dayProteinDone = totals.protein >= targets.protein;
            const dayCaloriesOver = totals.calories > targets.calories * 1.05;

            return (
              <button
                key={day.dateString}
                onClick={() => setFocusedDate(day.dateString)}
                className={[
                  "relative aspect-square rounded-2xl border text-sm active:scale-95",
                  isFocused
                    ? "border-green-500 bg-green-600 text-white"
                    : "border-zinc-800 bg-[#050807] text-zinc-300",
                  !day.isCurrentMonth ? "opacity-30" : "",
                  dayCaloriesOver && !isFocused ? "border-orange-500/70" : "",
                  isToday && !isFocused ? "ring-1 ring-green-500/50" : "",
                ].join(" ")}
              >
                <span>{day.date.getDate()}</span>

                {hasLog && (
                  <span
                    className={[
                      "absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full",
                      dayProteinDone ? "bg-green-400" : "bg-yellow-400",
                    ].join(" ")}
                  />
                )}

                {hasWorkoutDay && (
                  <span className="absolute left-1 top-1 text-[10px] text-blue-300">
                    ●
                  </span>
                )}

                {dayProteinDone && (
                  <span className="absolute right-1 top-1 text-[10px] text-green-300">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2 text-xs text-zinc-400">
          <div className="rounded-xl bg-[#050807] p-2">
            <span className="mr-1 inline-block h-2 w-2 rounded-full bg-green-400" />
            โปรตีนถึง
          </div>

          <div className="rounded-xl bg-[#050807] p-2">
            <span className="mr-1 inline-block h-2 w-2 rounded-full bg-yellow-400" />
            มีอาหาร
          </div>

          <div className="rounded-xl bg-[#050807] p-2">
            <span className="mr-1 inline-block h-2 w-2 rounded-full bg-blue-400" />
            มีเวท
          </div>

          <div className="rounded-xl bg-[#050807] p-2">
            <span className="mr-1 inline-block h-2 w-2 rounded-full border border-orange-400" />
            แคลเกิน
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-3xl border border-zinc-800 bg-zinc-950/80 p-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-zinc-400">วันที่เลือก</p>
            <h2 className="mt-1 text-xl font-bold">{focusedDate}</h2>
          </div>

          <button
            onClick={openFocusedDate}
            className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold active:scale-95"
          >
            เปิดวันนี้
          </button>
        </div>

        <div className="mb-4 grid grid-cols-4 gap-2 text-center text-xs">
          <MacroBadge label="kcal" value={focusedTotals.calories} />
          <MacroBadge label="P" value={focusedTotals.protein} />
          <MacroBadge label="C" value={focusedTotals.carbs} />
          <MacroBadge label="F" value={focusedTotals.fat} />
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-[#050807] p-3">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-semibold">Checklist</p>
            <p className="text-sm text-zinc-400">{completedCount}/6</p>
          </div>

          <ChecklistItem
            done={hasFocusedLog}
            label="มีการบันทึกอาหารแล้ว"
            detail={`${focusedLogs.length} รายการ`}
          />

          <ChecklistItem
            done={hasWorkout}
            label="มีการบันทึกออกกำลังกาย"
            detail={`${focusedWorkouts.length} รายการ`}
          />

          <ChecklistItem
            done={proteinDone}
            label="โปรตีนถึงเป้าหมาย"
            detail={`${Math.round(focusedTotals.protein)} / ${
              targets.protein
            }g`}
          />

          <ChecklistItem
            done={caloriesInRange}
            label="แคลอรี่อยู่ในช่วงเหมาะสม"
            detail={`${Math.round(focusedTotals.calories)} / ${
              targets.calories
            } kcal`}
          />

          <ChecklistItem
            done={fatNotOver}
            label="ไขมันไม่เกินเป้า"
            detail={`${Math.round(focusedTotals.fat)} / ${targets.fat}g`}
          />

          <ChecklistItem
            done={carbsNotOver}
            label="คาร์บไม่เกินเป้า"
            detail={`${Math.round(focusedTotals.carbs)} / ${targets.carbs}g`}
          />
        </div>
      </section>

      <section className="mt-4 rounded-3xl border border-zinc-800 bg-zinc-950/80 p-4">
        <h2 className="mb-3 font-semibold">ออกกำลังกาย</h2>

        {focusedWorkouts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-4 text-center text-sm text-zinc-500">
            วันนี้ยังไม่มีบันทึกออกกำลังกาย
          </div>
        ) : (
          <div className="space-y-2">
            {focusedWorkouts.map((workout) => (
              <div
                key={workout.id}
                className="flex items-center justify-between rounded-2xl bg-[#050807] p-3"
              >
                <div>
                  <p className="font-medium">{workout.label}</p>
                  <p className="text-xs text-zinc-500">
                    {workout.durationMinutes} นาที · {workout.intensity}
                  </p>
                </div>

                <p className="text-sm text-green-400">
                  {workout.caloriesBurned ?? 0} kcal
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-4 rounded-3xl border border-zinc-800 bg-zinc-950/80 p-4">
        <h2 className="mb-3 font-semibold">รายการอาหาร</h2>

        {focusedLogs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-4 text-center text-sm text-zinc-500">
            วันนี้ยังไม่มีรายการอาหาร
          </div>
        ) : (
          <div className="space-y-2">
            {focusedLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between rounded-2xl bg-[#050807] p-3"
              >
                <div>
                  <p className="font-medium">{log.name}</p>
                  <p className="text-xs text-zinc-500">
                    {log.mealType} · {log.amount} {log.unit}
                  </p>
                </div>

                <div className="text-right text-sm">
                  <p>{Math.round(log.calories)} kcal</p>
                  <p className="text-xs text-green-400">
                    P {round1(log.protein)}g
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {historyDates.length > 0 && (
        <section className="mt-4 rounded-3xl border border-zinc-800 bg-zinc-950/80 p-4">
          <h2 className="mb-3 font-semibold">วันที่มีบันทึกล่าสุด</h2>

          <div className="space-y-2">
            {historyDates.slice(0, 5).map((date) => {
              const logs = dailyLogs[date] ?? [];
              const workouts = dailyWorkouts[date] ?? [];
              const totals = getTotalsFromLogs(logs);

              return (
                <button
                  key={date}
                  onClick={() => {
                    setFocusedDate(date);
                    setCalendarMonth(getMonthStart(date));
                  }}
                  className="flex w-full items-center justify-between rounded-2xl bg-[#050807] p-3 text-left active:scale-[0.99]"
                >
                  <div>
                    <p className="font-medium">{date}</p>
                    <p className="text-xs text-zinc-500">
                      อาหาร {logs.length} · เวท {workouts.length}
                    </p>
                  </div>

                  <div className="text-right text-sm">
                    <p>{Math.round(totals.calories)} kcal</p>
                    <p className="text-xs text-green-400">
                      P {Math.round(totals.protein)}g
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}

function getGoalTypeLabel(goalType: GoalType) {
  if (goalType === "fat_loss") return "ลดไขมัน";
  if (goalType === "muscle_gain") return "เพิ่มกล้าม";
  return "Body Recomp";
}

function ProfilesPage({
  users,
  activeUserId,
  currentProfile,
  currentTargets,
  currentDailyLogs,
  currentDailyWorkouts,
  onSwitchUser,
  onCreateUser,
  onRenameUser,
  onDeleteUser,
}: {
  users: MacroMateUser[];
  activeUserId: string;
  currentProfile: UserProfile;
  currentTargets: Targets;
  currentDailyLogs: DailyLogs;
  currentDailyWorkouts: DailyWorkouts;
  onSwitchUser: (userId: string) => void;
  onCreateUser: (name: string) => void;
  onRenameUser: (userId: string, name: string) => void;
  onDeleteUser: (userId: string) => void;
}) {
  const [newUserName, setNewUserName] = useState("");

  function getUserSummary(user: MacroMateUser) {
    const isActive = user.id === activeUserId;
    const userProfile = isActive ? currentProfile : user.profile;
    const userTargets = isActive ? currentTargets : user.targets;
    const userLogs = isActive ? currentDailyLogs : user.dailyLogs;
    const userWorkouts = isActive ? currentDailyWorkouts : user.dailyWorkouts;

    const loggedDays = new Set([
      ...Object.keys(userLogs ?? {}).filter(
        (date) => (userLogs[date] ?? []).length > 0
      ),
      ...Object.keys(userWorkouts ?? {}).filter(
        (date) => (userWorkouts[date] ?? []).length > 0
      ),
    ]).size;

    const totalWorkouts = Object.values(userWorkouts ?? {}).reduce(
      (sum, day) => sum + day.length,
      0
    );

    return {
      userProfile,
      userTargets,
      loggedDays,
      totalWorkouts,
    };
  }

  function createNewUser() {
    onCreateUser(newUserName);
    setNewUserName("");
  }

  return (
    <>
      <header className="mb-6">
        <p className="text-sm text-zinc-400">Multi-user profile</p>
        <h1 className="mt-2 text-2xl font-bold">โปรไฟล์ผู้ใช้</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          ใช้สำหรับแยกข้อมูลอาหาร เป้าหมาย และประวัติออกกำลังกายของแต่ละคนในเครื่องนี้
        </p>
      </header>

      <section className="rounded-3xl border border-green-900/60 bg-green-950/20 p-4">
        <h2 className="font-semibold text-green-400">สร้างโปรไฟล์ใหม่</h2>
        <p className="mt-1 text-xs text-zinc-400">
          เหมาะสำหรับใช้ร่วมกันหลายคน เช่น คุณ แฟน เพื่อน หรือคนในครอบครัว
        </p>

        <div className="mt-3 flex gap-2">
          <input
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            placeholder="ชื่อโปรไฟล์ เช่น Kangaroo, แฟน, พี่ A"
            className="min-w-0 flex-1 rounded-xl border border-zinc-800 bg-[#050807] px-3 py-3 text-sm outline-none placeholder:text-zinc-600"
          />

          <button
            onClick={createNewUser}
            className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold active:scale-95"
          >
            สร้าง
          </button>
        </div>
      </section>

      <section className="mt-4 space-y-3">
        {users.map((user) => {
          const isActive = user.id === activeUserId;
          const summary = getUserSummary(user);

          return (
            <div
              key={user.id}
              className={`rounded-3xl border p-4 ${
                isActive
                  ? "border-green-600 bg-green-950/20"
                  : "border-zinc-800 bg-zinc-950/80"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-600 text-lg font-bold text-white">
                      {user.name.trim().slice(0, 1).toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-xs text-zinc-500">
                        {isActive ? "กำลังใช้งานอยู่" : "โปรไฟล์อื่น"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-2xl bg-[#050807] p-3">
                      <p className="text-zinc-500">น้ำหนัก</p>
                      <p className="mt-1 font-semibold">
                        {summary.userProfile.weight} kg
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#050807] p-3">
                      <p className="text-zinc-500">ส่วนสูง</p>
                      <p className="mt-1 font-semibold">
                        {summary.userProfile.height} cm
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#050807] p-3">
                      <p className="text-zinc-500">Body Fat</p>
                      <p className="mt-1 font-semibold">
                        {summary.userProfile.bodyFat}%
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#050807] p-3">
                      <p className="text-zinc-500">เป้าหมายล่าสุด</p>
                      <p className="mt-1 font-semibold text-green-400">
                        {getGoalTypeLabel(summary.userProfile.goalType)}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#050807] p-3">
                      <p className="text-zinc-500">แคล / วัน</p>
                      <p className="mt-1 font-semibold">
                        {summary.userTargets.calories} kcal
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#050807] p-3">
                      <p className="text-zinc-500">โปรตีนเป้า</p>
                      <p className="mt-1 font-semibold">
                        {summary.userTargets.protein} g
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#050807] p-3">
                      <p className="text-zinc-500">วันที่มีบันทึก</p>
                      <p className="mt-1 font-semibold">{summary.loggedDays} วัน</p>
                    </div>

                    <div className="rounded-2xl bg-[#050807] p-3">
                      <p className="text-zinc-500">Workout</p>
                      <p className="mt-1 font-semibold">
                        {summary.totalWorkouts} รายการ
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                <button
                  onClick={() => onSwitchUser(user.id)}
                  disabled={isActive}
                  className={`rounded-xl px-3 py-2 font-semibold active:scale-95 disabled:opacity-50 ${
                    isActive
                      ? "border border-green-800 text-green-400"
                      : "bg-green-600 text-white"
                  }`}
                >
                  {isActive ? "ใช้อยู่" : "เลือก"}
                </button>

                <button
                  onClick={() => {
                    const nextName = window.prompt("ตั้งชื่อโปรไฟล์ใหม่", user.name);
                    if (nextName) onRenameUser(user.id, nextName);
                  }}
                  className="rounded-xl border border-zinc-800 px-3 py-2 text-zinc-300 active:scale-95"
                >
                  เปลี่ยนชื่อ
                </button>

                <button
                  onClick={() => onDeleteUser(user.id)}
                  className="rounded-xl border border-red-900/60 px-3 py-2 text-red-400 active:scale-95"
                >
                  ลบ
                </button>
              </div>
            </div>
          );
        })}
      </section>

    </>
  );
}

function Goals({
  profile,
  setProfile,
  targets,
  setTargets,
  recommendedTargets,
  onApplyRecommended,
  onResetAllData,
}: {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
  targets: Targets;
  setTargets: (targets: Targets) => void;
  recommendedTargets: Targets;
  onApplyRecommended: () => void;
  onResetAllData: () => void;
}) {
  const bmr = Math.round(calculateBmr(profile));
  const tdee = Math.round(calculateTdee(profile));
  const macroCalories = caloriesFromMacros(targets);
  const calorieDiff = Math.round(targets.calories - macroCalories);

  function updateCalories(nextCalories: number) {
    setTargets({
      ...targets,
      calories: nextCalories,
      carbs: calcCarbsFromCalories(nextCalories, targets.protein, targets.fat),
    });
  }

  function updateProtein(nextProtein: number) {
    setTargets({
      ...targets,
      protein: nextProtein,
      carbs: calcCarbsFromCalories(targets.calories, nextProtein, targets.fat),
    });
  }

  function updateFat(nextFat: number) {
    setTargets({
      ...targets,
      fat: nextFat,
      carbs: calcCarbsFromCalories(targets.calories, targets.protein, nextFat),
    });
  }

  function updateCarbs(nextCarbs: number) {
    setTargets({
      ...targets,
      carbs: nextCarbs,
      fat: calcFatFromCalories(targets.calories, targets.protein, nextCarbs),
    });
  }

  return (
    <>
      <header className="mb-6">
        <p className="text-sm text-zinc-400">Profile + Macro Target</p>
        <h1 className="mt-2 text-2xl font-bold">เป้าหมาย</h1>
      </header>

      <section className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-4">
        <h2 className="mb-3 font-semibold">ข้อมูลร่างกาย</h2>

        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label="น้ำหนัก kg"
            value={profile.weight}
            onChange={(value) => setProfile({ ...profile, weight: value })}
          />

          <NumberInput
            label="ส่วนสูง cm"
            value={profile.height}
            onChange={(value) => setProfile({ ...profile, height: value })}
          />

          <NumberInput
            label="อายุ"
            value={profile.age}
            onChange={(value) => setProfile({ ...profile, age: value })}
          />

          <NumberInput
            label="Body Fat %"
            value={profile.bodyFat}
            onChange={(value) => setProfile({ ...profile, bodyFat: value })}
          />
        </div>

        <label className="mt-3 block text-sm text-zinc-400">
          กิจกรรมต่อสัปดาห์
        </label>

        <select
          value={profile.activityLevel}
          onChange={(e) =>
            setProfile({
              ...profile,
              activityLevel: e.target.value as ActivityLevel,
            })
          }
          className="mt-1 w-full rounded-xl border border-zinc-800 bg-[#050807] px-3 py-3 text-sm outline-none"
        >
          {Object.entries(activityOptions).map(([key, option]) => (
            <option key={key} value={key}>
              {option.label}
            </option>
          ))}
        </select>

        <label className="mt-3 block text-sm text-zinc-400">เป้าหมาย</label>

        <select
          value={profile.goalType}
          onChange={(e) =>
            setProfile({
              ...profile,
              goalType: e.target.value as GoalType,
            })
          }
          className="mt-1 w-full rounded-xl border border-zinc-800 bg-[#050807] px-3 py-3 text-sm outline-none"
        >
          <option value="body_recomp">Body Recomposition</option>
          <option value="fat_loss">Fat Loss</option>
          <option value="muscle_gain">Muscle Gain</option>
        </select>
      </section>

      <section className="mt-4 rounded-3xl border border-zinc-800 bg-zinc-950/80 p-4">
        <h2 className="mb-3 font-semibold">พลังงานที่คำนวณได้</h2>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl bg-[#050807] p-3">
            <p className="text-zinc-500">BMR</p>
            <p className="mt-1 text-lg font-bold">{bmr} kcal</p>
          </div>

          <div className="rounded-2xl bg-[#050807] p-3">
            <p className="text-zinc-500">TDEE</p>
            <p className="mt-1 text-lg font-bold">{tdee} kcal</p>
          </div>
        </div>

        <p className="mt-3 text-xs leading-5 text-zinc-500">
          BMR คือพลังงานพื้นฐานที่ร่างกายใช้ต่อวัน ส่วน TDEE คือ BMR
          ที่คูณระดับกิจกรรมแล้ว ใช้เป็นฐานในการลดไขมัน เพิ่มกล้าม
          หรือทำ body recomposition
        </p>
      </section>

      <section className="mt-4 rounded-3xl border border-green-900/60 bg-green-950/20 p-4">
        <h2 className="font-semibold text-green-400">ค่าแนะนำตามเป้าหมาย</h2>

        <p className="mt-2 text-sm text-zinc-400">
          ค่าแนะนำนี้คำนวณจาก TDEE + เป้าหมาย + น้ำหนักตัว
        </p>

        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <p>แคล: {recommendedTargets.calories} kcal</p>
          <p>โปรตีน: {recommendedTargets.protein}g</p>
          <p>คาร์บ: {recommendedTargets.carbs}g</p>
          <p>ไขมัน: {recommendedTargets.fat}g</p>
        </div>

        <div className="mt-3 rounded-2xl bg-[#050807]/70 p-3 text-xs leading-5 text-zinc-400">
          {profile.goalType === "fat_loss" && (
            <p>
              Fat Loss: ใช้แคลต่ำกว่า TDEE ประมาณ 500 kcal,
              โปรตีนสูงเพื่อรักษากล้าม, ไขมันพอเหมาะ
              และให้คาร์บเป็นพลังงานที่เหลือ
            </p>
          )}

          {profile.goalType === "body_recomp" && (
            <p>
              Body Recomposition: ใช้แคลต่ำกว่า TDEE เล็กน้อยประมาณ 250 kcal,
              โปรตีนสูง, คาร์บยังพอสำหรับเล่นเวท และไม่ลดไขมันต่ำเกินไป
            </p>
          )}

          {profile.goalType === "muscle_gain" && (
            <p>
              Muscle Gain: ใช้แคลสูงกว่า TDEE ประมาณ 250 kcal,
              โปรตีนสูง, เพิ่มคาร์บเพื่อช่วย performance และ recovery
            </p>
          )}
        </div>

        <button
          onClick={onApplyRecommended}
          className="mt-4 w-full rounded-2xl bg-green-600 py-3 font-semibold active:scale-95"
        >
          ใช้ค่าแนะนำนี้
        </button>
      </section>

      <section className="mt-4 rounded-3xl border border-zinc-800 bg-zinc-950/80 p-4">
        <h2 className="mb-1 font-semibold">กำหนดเป้าหมายเอง</h2>

        <p className="mb-3 text-xs text-zinc-500">
          เมื่อแก้โปรตีน/ไขมัน ระบบจะปรับคาร์บให้อัตโนมัติ
          เพื่อให้พลังงานรวมใกล้เคียงแคลอรี่เป้าหมาย
        </p>

        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label="แคลอรี่"
            value={targets.calories}
            onChange={updateCalories}
          />

          <NumberInput
            label="โปรตีน"
            value={targets.protein}
            onChange={updateProtein}
          />

          <NumberInput
            label="คาร์บ"
            value={targets.carbs}
            onChange={updateCarbs}
          />

          <NumberInput
            label="ไขมัน"
            value={targets.fat}
            onChange={updateFat}
          />
        </div>

        <div className="mt-3 rounded-2xl border border-zinc-800 bg-[#050807] p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">แคลจาก Macro รวม</span>
            <span
              className={
                Math.abs(calorieDiff) <= 20
                  ? "font-semibold text-green-400"
                  : "font-semibold text-yellow-400"
              }
            >
              {Math.round(macroCalories)} kcal
            </span>
          </div>

          <div className="mt-1 flex items-center justify-between">
            <span className="text-zinc-400">ส่วนต่างจากเป้าหมาย</span>
            <span
              className={
                Math.abs(calorieDiff) <= 20
                  ? "font-semibold text-green-400"
                  : "font-semibold text-yellow-400"
              }
            >
              {calorieDiff > 0 ? "+" : ""}
              {calorieDiff} kcal
            </span>
          </div>
        </div>
      </section>

      <button
        onClick={onResetAllData}
        className="mt-6 w-full rounded-2xl border border-red-900/60 py-3 text-sm font-semibold text-red-400 active:scale-95"
      >
        ล้างข้อมูลทั้งหมด
      </button>
    </>
  );
}

function MacroRow({
  label,
  current,
  target,
  unit,
  color,
}: {
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
}) {
  const percent =
    target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

  const remaining = target - current;
  const isOver = remaining < 0;

  return (
    <div className="border-b border-zinc-800 py-4 last:border-b-0">
      <div className="mb-2 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-400">{label}</p>
          <p className="text-lg font-bold">
            {Math.round(current).toLocaleString()} / {target.toLocaleString()}{" "}
            {unit}
          </p>
        </div>

        <div className="text-right">
          <p
            className={
              isOver ? "text-sm text-red-400" : "text-sm text-zinc-400"
            }
          >
            {isOver
              ? `เกิน ${Math.abs(
                  Math.round(remaining)
                ).toLocaleString()} ${unit}`
              : `ขาด ${Math.round(remaining).toLocaleString()} ${unit}`}
          </p>

          <p className="text-sm text-zinc-500">{percent}%</p>
        </div>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function MealCard({
  item,
  onDelete,
  onUpdateAmount,
}: {
  item: MealLog;
  onDelete: () => void;
  onUpdateAmount: (amount: number) => void;
}) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-green-400">{item.name}</p>
          <p className="mt-1 text-xs text-zinc-500">{item.mealType}</p>

          <div className="mt-3 flex items-center gap-2">
            <input
              type="number"
              min="0"
              value={item.amount}
              onChange={(e) => onUpdateAmount(Number(e.target.value))}
              className="w-24 rounded-xl border border-zinc-800 bg-[#050807] px-3 py-2 text-sm outline-none"
            />

            <span className="text-sm text-zinc-400">{item.unit}</span>
          </div>
        </div>

        <div className="text-right">
          <p className="font-semibold">{Math.round(item.calories)} kcal</p>

          <p className="mt-2 text-sm text-green-400">
            P {round1(item.protein)}g
          </p>

          <p className="text-sm text-blue-400">C {round1(item.carbs)}g</p>

          <p className="text-sm text-yellow-400">F {round1(item.fat)}g</p>

          <button
            onClick={onDelete}
            className="mt-3 rounded-xl border border-red-900/60 px-3 py-1 text-xs text-red-400 active:scale-95"
          >
            ลบ
          </button>
        </div>
      </div>
    </div>
  );
}

function MacroBadge({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-[#050807] px-2 py-2">
      <p className="text-zinc-500">{label}</p>
      <p className="font-semibold">{round1(value)}</p>
    </div>
  );
}

function ChecklistItem({
  done,
  label,
  detail,
}: {
  done: boolean;
  label: string;
  detail: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-800 py-3 last:border-b-0">
      <div className="flex items-center gap-3">
        <div
          className={[
            "flex h-6 w-6 items-center justify-center rounded-full border text-xs",
            done
              ? "border-green-500 bg-green-600 text-white"
              : "border-zinc-700 text-zinc-500",
          ].join(" ")}
        >
          {done ? "✓" : ""}
        </div>

        <div>
          <p className={done ? "text-zinc-100" : "text-zinc-400"}>{label}</p>
          <p className="text-xs text-zinc-500">{detail}</p>
        </div>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="mb-3 block">
      <span className="text-sm text-zinc-400">{label}</span>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-zinc-800 bg-[#050807] px-3 py-3 text-sm outline-none"
      />
    </label>
  );
}

function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="mb-3 block">
      <span className="text-sm text-zinc-400">{label}</span>

      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full rounded-xl border border-zinc-800 bg-[#050807] px-3 py-3 text-sm outline-none"
      />
    </label>
  );
}

function BottomNav({
  activeTab,
  setActiveTab,
}: {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}) {
  const items: { label: string; tab: Tab }[] = [
    { label: "หน้าหลัก", tab: "home" },
    { label: "อาหาร", tab: "add" },
    { label: "ออกกำลัง", tab: "workout" },
    { label: "ฐาน", tab: "database" },
    { label: "ย้อนหลัง", tab: "history" },
    { label: "เป้า", tab: "goals" },
    { label: "โปรไฟล์", tab: "profiles" },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 grid w-full max-w-md -translate-x-1/2 grid-cols-7 border-t border-zinc-800 bg-[#050807]/95 px-1 py-3 text-[11px] text-zinc-500 backdrop-blur">
      {items.map((item) => (
        <button
          key={item.tab}
          onClick={() => setActiveTab(item.tab)}
          className={`py-2 active:scale-95 ${
            activeTab === item.tab ? "font-semibold text-green-500" : ""
          }`}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}