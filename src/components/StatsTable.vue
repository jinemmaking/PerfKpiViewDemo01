<template>
  <el-card shadow="never">
    <template #header>
      <span class="font-medium">数据详情统计表</span>
    </template>
    <el-table :data="rows" stripe empty-text="暂无数据">
      <el-table-column prop="name" label="端口名称 (或计算项)" min-width="220" />
      <el-table-column prop="max" label="最大值 (Max)" min-width="150" align="right">
        <template #default="{ row }">{{ formatTraffic(row.max) }}</template>
      </el-table-column>
      <el-table-column prop="min" label="最小值 (Min)" min-width="150" align="right">
        <template #default="{ row }">{{ formatTraffic(row.min) }}</template>
      </el-table-column>
      <el-table-column prop="avg" label="平均值 (Avg)" min-width="150" align="right">
        <template #default="{ row }">{{ formatTraffic(row.avg) }}</template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup lang="ts">
import { formatTraffic } from "../utils/formatTraffic";
import type { StatsRow } from "../types";

defineProps<{
  rows: StatsRow[];
}>();
</script>
