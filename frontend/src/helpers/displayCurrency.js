const displayINRCurrency = (num) => {
  const formatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0, // VND không có số thập phân
  });

  return formatter.format(num);
};

export default displayINRCurrency;
