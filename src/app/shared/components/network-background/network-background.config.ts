// Toàn bộ tham số hình ảnh/chuyển động của NetworkBackground được gom vào đây — component/engine
// không hard-code số liệu, cho phép nơi dùng (vd LoginPage) override một phần qua input `config`
// mà không phải sửa logic vẽ.
export interface NetworkBackgroundConfig {
  // Số lượng hạt sáng — mặc định để ít (30-50) và phóng to từng hạt thay vì rất nhiều hạt li ti,
  // cho từng "node" rõ ràng, có thể click tương tác được.
  readonly particleCount: number;
  // Màu nền canvas (clear color), dạng hex string.
  readonly backgroundColor: string;
  // 2 màu được nội suy ngẫu nhiên cho từng hạt/đường nối — tạo sự đa dạng nhẹ không đơn điệu.
  readonly particleColors: readonly [string, string];
  // Chiều cao "world space" (OrthographicCamera) phủ chiều cao viewport — giá trị càng NHỎ thì
  // càng "zoom in" (cùng particleSize/connectionDistance tính theo world unit sẽ chiếm tỉ lệ màn
  // hình lớn hơn, particle/đường nối trông to và dày hơn).
  readonly viewHeight: number;
  // Kích thước hạt tính theo world unit (viewHeight world unit phủ chiều cao viewport).
  readonly particleSize: number;
  // Khoảng cách (world unit) mà 2 hạt được nối bằng đường mảnh; xa hơn thì không vẽ, gần hơn thì
  // đường càng rõ (alpha tỉ lệ nghịch với khoảng cách).
  readonly connectionDistance: number;
  // Khoảng cách (world unit) mà 2 hạt bắt đầu đẩy nhau ra xa — PHẢI nhỏ hơn connectionDistance.
  // Không có lực này, trường Perlin Noise có thể vô tình "cuốn" nhiều hạt trôi cùng hướng theo thời
  // gian (nhất là khi có ít hạt), khiến chúng dồn cụm lại một chỗ và để trống phần còn lại màn hình.
  readonly separationDistance: number;
  // Cường độ lực đẩy (world unit/giây) khi 2 hạt trùng vị trí hoàn toàn, giảm tuyến tính về 0 khi
  // khoảng cách = separationDistance.
  readonly separationStrength: number;
  // Giới hạn cứng số đường nối vẽ mỗi frame — van an toàn hiệu năng khi hạt tụ lại quá dày ở một
  // vùng (tránh số cặp tăng vọt kiểu O(n^2) trong trường hợp xấu).
  readonly maxConnections: number;
  // Hệ số tốc độ trôi của hạt theo trường Perlin Noise (world unit/giây, xấp xỉ).
  readonly driftSpeed: number;
  // Tần số lấy mẫu noise theo không gian — nhỏ hơn = luồng chuyển động mượt/rộng hơn.
  readonly noiseSpaceFrequency: number;
  // Tần số lấy mẫu noise theo thời gian — nhỏ hơn = trường chuyển động tiến hoá chậm hơn.
  readonly noiseTimeFrequency: number;
  // Mức độ mạng lưới dịch chuyển theo con trỏ chuột (0 = tắt hẳn parallax).
  readonly parallaxStrength: number;
  // Hệ số làm mượt (easing) khi parallax đuổi theo vị trí con trỏ — càng nhỏ càng "êm", không giật.
  readonly parallaxDamping: number;
  readonly bloomStrength: number;
  readonly bloomRadius: number;
  readonly bloomThreshold: number;
}

export const DEFAULT_NETWORK_BACKGROUND_CONFIG: NetworkBackgroundConfig = {
  // Ít hạt (30-50) nhưng mỗi hạt to/rõ, dàn trải cả màn hình (viewHeight rộng) thay vì zoom camera
  // vào 1 vùng nhỏ — hợp với số lượng ít, để mạng lưới vẫn phủ được toàn bộ nền.
  particleCount: 40,
  backgroundColor: '#050816',
  particleColors: ['#22d3ee', '#3b82f6'],
  viewHeight: 10,
  // To hơn hẳn bản nhiều-hạt trước đó (0.055) — với chỉ 30-50 hạt, mỗi hạt là 1 "node" cần đủ lớn
  // để nhìn rõ và dễ click trúng.
  particleSize: 0.32,
  // Hạt thưa hơn nhiều (40 hạt thay vì 1000) nên cần bán kính nối lớn hơn hẳn để vẫn thấy được cấu
  // trúc "mạng lưới" thay vì các chấm rời rạc không đường nối.
  connectionDistance: 4,
  separationDistance: 1.8,
  separationStrength: 1.4,
  // Số cặp tối đa có thể có với 40 hạt là 40*39/2=780 — 500 đã dư dả, không cần buffer lớn như bản
  // nhiều hạt trước đó.
  maxConnections: 500,
  driftSpeed: 0.16,
  noiseSpaceFrequency: 0.22,
  noiseTimeFrequency: 0.05,
  parallaxStrength: 0.6,
  parallaxDamping: 0.04,
  // Tăng so với bản đầu để hạt/đường nối sáng rõ hơn — threshold thấp hơn khiến bloom kích hoạt dễ
  // hơn (kể cả vùng không quá sáng), radius rộng hơn cho quầng sáng mềm mại hơn một chút.
  bloomStrength: 0.85,
  bloomRadius: 0.45,
  bloomThreshold: 0.08,
};
