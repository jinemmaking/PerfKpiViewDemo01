import dayjs from "dayjs";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type { MetricType, ModeType, QuickRangeType, SavedView } from "../types";

const SAVED_VIEW_KEY = "performance-dashboard-saved-views";

const defaultRange = (): [Date, Date] => [dayjs().subtract(1, "hour").toDate(), new Date()];

export const useDashboardStore = defineStore("dashboard", () => {
  const selectedPortIds = ref<string[]>([]);
  const metric = ref<MetricType>("in_traffic");
  const mode = ref<ModeType>("original");
  const quickRange = ref<QuickRangeType>("1h");
  const customRange = ref<[Date, Date]>(defaultRange());
  const chartSize = ref<"S" | "M" | "L">("M");
  const activeSavedViewId = ref<string>("");
  const savedViews = ref<SavedView[]>([]);

  const selectedCount = computed(() => selectedPortIds.value.length);

  const replaceSelectedPorts = (ids: string[]) => {
    selectedPortIds.value = [...ids];
  };

  const loadSavedViews = () => {
    const raw = localStorage.getItem(SAVED_VIEW_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as SavedView[];
      savedViews.value = Array.isArray(parsed) ? parsed : [];
    } catch {
      savedViews.value = [];
    }
  };

  const persistSavedViews = () => {
    localStorage.setItem(SAVED_VIEW_KEY, JSON.stringify(savedViews.value));
  };

  const addSavedView = (name: string) => {
    const view: SavedView = {
      id: `view-${Date.now()}`,
      name,
      portIds: [...selectedPortIds.value],
      metric: metric.value,
      mode: mode.value,
    };
    savedViews.value = [view, ...savedViews.value];
    activeSavedViewId.value = view.id;
    persistSavedViews();
  };

  const applySavedView = (id: string) => {
    const view = savedViews.value.find((item) => item.id === id);
    if (!view) return;
    activeSavedViewId.value = id;
    selectedPortIds.value = [...view.portIds];
    metric.value = view.metric;
    mode.value = view.mode;
  };

  return {
    selectedPortIds,
    metric,
    mode,
    quickRange,
    customRange,
    chartSize,
    selectedCount,
    savedViews,
    activeSavedViewId,
    replaceSelectedPorts,
    addSavedView,
    applySavedView,
    loadSavedViews,
  };
});
