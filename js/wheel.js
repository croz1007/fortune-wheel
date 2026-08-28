(() => {
  "use strict";

  function draw(canvas, values, colors) {
    const ctx = canvas.getContext("2d");
    const size = canvas.width;
    const center = size / 2;
    const radius = center - 16;
    const slice = (Math.PI * 2) / values.length;

    ctx.clearRect(0, 0, size, size);

    values.forEach((value, index) => {
      const start = index * slice - Math.PI / 2;
      const end = start + slice;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = segmentColor(value, index, colors);
      ctx.fill();
      ctx.lineWidth = 5;
      ctx.strokeStyle = "#171513";
      ctx.stroke();

      drawLabel(ctx, value, index, start, slice, center, radius);
    });

    ctx.beginPath();
    ctx.arc(center, center, 90, 0, Math.PI * 2);
    ctx.fillStyle = "#171513";
    ctx.fill();
    ctx.lineWidth = 8;
    ctx.strokeStyle = "#d8a33d";
    ctx.stroke();
  }

  function segmentColor(value, index, colors) {
    if (value === "BANKRUPT") return "#171513";
    if (value === "LOSE A TURN") return "#ded5c8";
    return colors[index % colors.length];
  }

  function drawLabel(ctx, value, index, start, slice, center, radius) {
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(start + slice / 2);
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.font = value.length > 6 ? "800 22px sans-serif" : "900 29px sans-serif";
    ctx.fillStyle = value === "LOSE A TURN" ? "#171513" : "#fff8ef";
    ctx.shadowColor = "rgba(0,0,0,0.45)";
    ctx.shadowBlur = 3;
    ctx.fillText(FridayWheelCore.formatWheelValue(value), radius - 32, 0);
    ctx.restore();
  }

  function planSpin(currentRotation, segmentCount) {
    const segmentAngle = 360 / segmentCount;
    const targetIndex = Math.floor(Math.random() * segmentCount);
    const targetCenter = targetIndex * segmentAngle + segmentAngle / 2;
    const normalizedCurrent = normalizeDegrees(currentRotation);
    const desired = (360 - targetCenter) % 360;

    let delta = desired - normalizedCurrent;
    if (delta < 0) delta += 360;

    const extraSpins = 5 + Math.floor(Math.random() * 3);
    return currentRotation + extraSpins * 360 + delta;
  }

  function indexAtPointer(rotation, segmentCount) {
    const segmentAngle = 360 / segmentCount;
    const angleAtPointer = (360 - normalizeDegrees(rotation)) % 360;
    return Math.floor(angleAtPointer / segmentAngle) % segmentCount;
  }

  function normalizeDegrees(value) {
    return ((value % 360) + 360) % 360;
  }

  window.FridayWheelRenderer = Object.freeze({
    draw,
    planSpin,
    indexAtPointer
  });
})();
