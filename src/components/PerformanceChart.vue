<template>
  <el-card shadow="never" class="mb-3">
    <template #header>
      <div class="flex items-center justify-between">
        <span class="font-medium">性能曲线看板（已选: {{ selectedCount }}/10）</span>
        <span v-if="statsLabel" class="text-sm text-slate-500">{{ statsLabel }}</span>
      </div>
    </template>
    <div :style="{ height: chartHeight }" ref="containerRef"></div>
  </el-card>
</template>

<script setup lang="ts">
import * as echarts from "echarts";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import type { PortSeries } from "../types";
import { formatTraffic } from "../utils/formatTraffic";
import { computeStats } from "../utils/stats";

const props = defineProps<{
  series: PortSeries[];
  selectedCount: number;
  size: "S" | "M" | "L";
  loading: boolean;
}>();

const containerRef = ref<HTMLDivElement>();
let chart: echarts.ECharts | null = null;

const chartHeight = computed(() => {
  if (props.size === "S") return "260px";
  if (props.size === "L") return "460px";
  return "340px";
});

const statsLabel = computed(() => {
  if (!props.series.length) return "";
  const first = props.series[0];
  const stats = computeStats(first.points);
  return `Max ${formatTraffic(stats.max)} / Min ${formatTraffic(stats.min)}`;
});

const buildOption = (): echarts.EChartsOption => {
  if (!props.series.length) {
    return { xAxis: { type: "category", data: [] }, yAxis: { type: "value" }, series: [] };
  }
  const xAxis = props.series[0].points.map((item) => item.timestamp);
  const seriesData = props.series.map((item) => {
    const stats = computeStats(item.points);
    return {
      type: "line",
      name: `${item.portName} (Max ${formatTraffic(stats.max)})`,
      smooth: true,
      showSymbol: false,
      areaStyle: {},
      data: item.points.map((point) => Number(point.value.toFixed(2))),
      markLine: {
        symbol: "none",
        lineStyle: { type: "dashed" },
        data: [{ yAxis: stats.avg }],
      },
    };
  });

  return {
    animation: true,
    tooltip: {
      trigger: "axis",
      valueFormatter: (value) => formatTraffic(Number(value)),
    },
    legend: {
      type: "scroll",
      top: 4,
    },
    grid: { left: 40, right: 20, top: 46, bottom: 56 },
    xAxis: { type: "category", data: xAxis, boundaryGap: false },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: (value: number) => formatTraffic(value),
      },
    },
    dataZoom: [{ type: "inside" }, { type: "slider", height: 20 }],
    series: seriesData,
  };
};

const renderChart = () => {
  if (!containerRef.value) return;
  if (!chart) {
    chart = echarts.init(containerRef.value);
  }
  chart.showLoading({ text: props.loading ? "Loading..." : "" });
  chart.setOption(buildOption(), true);
  if (!props.loading) {
    chart.hideLoading();
  }
  chart.resize();
};

watch(() => [props.series, props.size, props.loading], renderChart, { deep: true });

onMounted(() => {
  renderChart();
  window.addEventListener("resize", renderChart);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", renderChart);
  chart?.dispose();
  chart = null;
});
</script>
