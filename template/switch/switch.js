const Switch = {
  _handleXkdSwitchChange(e) {
    const dataset = e.currentTarget.dataset;

    const checked = !dataset.checked;
    const loading = dataset.loading;
    const disabled = dataset.disabled;
    const componentId = dataset.componentId;
    const switchType = dataset.switchType;

    if (loading || disabled) return;

    console.info('[xkd:switch:change]', { checked, componentId, switchType });

    if (this.handleXkdSwitchChange) {
      this.handleXkdSwitchChange({
        checked,
        componentId,
        switchType
      });
    } else {
      console.warn('页面缺少 handleXkdSwitchChange 回调函数');
    }
  }
};

module.exports = Switch;
