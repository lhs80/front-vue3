<template>
  <svg aria-hidden="true" class="svg-icon-spin" :class="classes">
    <use :xlink:href="symbolId" :fill="color"/>
    <title>{{props.title}}</title>
  </svg>
</template>

<script lang="ts" setup>
  const props = defineProps({
    prefix: {
      type: String,
      default: "icon",
    },
    name: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      default: "#333",
    },
    size: {
      type: Number,
      default: 20,
    },
    title: {
      type: String,
      default: '',
    },
  });
  const router = useRouter();
  const symbolId = computed(() => `#${props.prefix}-${props.name}`);
  const classes = computed(() => {
    return {
      [`sdms-size-${props.size}`]: props.size,
    };
  });
  const fontSize = reactive({default: props.size + 'px', small: "16px", large: "30px"});
</script>
<style lang="less" scoped>
  .svg-icon-spin {
    width: v-bind("fontSize.default");
    height: v-bind("fontSize.default");
    fill: v-bind(color);
    vertical-align: middle;
    color: v-bind(color);

    &.sdms-size-small {
      width: v-bind("fontSize.small") !important;
      height: v-bind("fontSize.small") !important;
    }

    &.sdms-size-large {
      width: v-bind("fontSize.large") !important;
      height: v-bind("fontSize.large") !important;
    }
  }
</style>
