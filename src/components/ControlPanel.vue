<template>
  <el-card shadow="never" class="mb-3">
    <div class="grid grid-cols-1 gap-3 xl:grid-cols-[180px_240px_1fr_auto]">
      <el-select v-model="store.metric" placeholder="选择指标">
        <el-option label="入流量 (In-Traffic)" value="in_traffic" />
        <el-option label="出流量 (Out-Traffic)" value="out_traffic" />
        <el-option label="入带宽利用率 (In-Usage)" value="in_usage" />
        <el-option label="出带宽利用率 (Out-Usage)" value="out_usage" />
      </el-select>
      <el-radio-group v-model="store.mode">
        <el-radio-button label="原始值" value="original" />
        <el-radio-button label="求和" value="sum" />
        <el-radio-button label="平均" value="avg" />
      </el-radio-group>
      <div class="flex flex-wrap items-center gap-2">
        <el-radio-group v-model="store.quickRange" @change="onQuickRangeChange">
          <el-radio-button value="1h">近1h</el-radio-button>
          <el-radio-button value="6h">近6h</el-radio-button>
          <el-radio-button value="24h">近24h</el-radio-button>
          <el-radio-button value="custom">自定义</el-radio-button>
        </el-radio-group>
        <el-date-picker
          v-model="store.customRange"
          type="datetimerange"
          value-format="x"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          :disabled="store.quickRange !== 'custom'"
        />
      </div>
      <div class="flex items-center justify-end gap-2">
        <el-button-group>
          <el-button :type="store.chartSize === 'S' ? 'primary' : 'default'" @click="store.chartSize = 'S'"
            >S</el-button
          >
          <el-button :type="store.chartSize === 'M' ? 'primary' : 'default'" @click="store.chartSize = 'M'"
            >M</el-button
          >
          <el-button :type="store.chartSize === 'L' ? 'primary' : 'default'" @click="store.chartSize = 'L'"
            >L</el-button
          >
        </el-button-group>
        <el-button type="primary" @click="$emit('query')">查询</el-button>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import { useDashboardStore } from "../stores/dashboard";

defineEmits<{
  query: [];
}>();

const store = useDashboardStore();

const onQuickRangeChange = (value: "1h" | "6h" | "24h" | "custom") => {
  if (value === "custom") return;
  const now = dayjs();
  const start = now.subtract(Number(value.replace("h", "")), "hour");
  store.customRange = [start.toDate(), now.toDate()];
};
</script>
