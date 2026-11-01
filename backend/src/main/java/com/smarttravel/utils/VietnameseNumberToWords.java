package com.smarttravel.utils;

import java.math.BigDecimal;
import java.math.BigInteger;

/**
 * Utility chuyển đổi số tiền (VND) sang chữ tiếng Việt chuẩn (đã lược bỏ từ "chẵn" và "lẻ").
 * Ví dụ: 15,200,000 -> "Mười lăm triệu hai trăm nghìn đồng."
 */
public class VietnameseNumberToWords {

    private static final String[] DIGITS = {
            "không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"
    };

    private static final String[] UNITS = {
            "", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"
    };

    public static String convertToWords(BigDecimal amount) {
        if (amount == null) {
            return "Không đồng.";
        }
        BigInteger number = amount.toBigInteger();
        if (number.compareTo(BigInteger.ZERO) == 0) {
            return "Không đồng.";
        }
        if (number.compareTo(BigInteger.ZERO) < 0) {
            return "Âm " + convertToWords(amount.abs());
        }

        String strNumber = number.toString();
        // Cắt thành các nhóm 3 chữ số từ phải sang trái
        int length = strNumber.length();
        int groupCount = (length + 2) / 3;

        // Pad left with zeros to make length multiple of 3
        int padLength = groupCount * 3 - length;
        StringBuilder padded = new StringBuilder();
        for (int i = 0; i < padLength; i++) {
            padded.append("0");
        }
        padded.append(strNumber);
        strNumber = padded.toString();

        StringBuilder result = new StringBuilder();
        boolean hasPreviousGroup = false;

        for (int i = 0; i < groupCount; i++) {
            int groupIndex = groupCount - 1 - i;
            String groupStr = strNumber.substring(i * 3, i * 3 + 3);
            int groupValue = Integer.parseInt(groupStr);

            if (groupValue > 0) {
                String groupWords = readGroup(groupStr, hasPreviousGroup);
                result.append(groupWords);
                if (groupIndex < UNITS.length && !UNITS[groupIndex].isEmpty()) {
                    result.append(" ").append(UNITS[groupIndex]);
                }
                result.append(" ");
                hasPreviousGroup = true;
            }
        }

        String finalResult = result.toString().trim().replaceAll("\\s+", " ");
        if (finalResult.isEmpty()) {
            return "Không đồng.";
        }

        // Viết hoa chữ cái đầu tiên và kết thúc bằng "đồng." (không có từ chẵn)
        finalResult = Character.toUpperCase(finalResult.charAt(0)) + finalResult.substring(1) + " đồng.";
        return finalResult;
    }

    private static String readGroup(String group, boolean hasHigherGroup) {
        int a = group.charAt(0) - '0';
        int b = group.charAt(1) - '0';
        int c = group.charAt(2) - '0';

        StringBuilder sb = new StringBuilder();

        // Đọc hàng trăm
        if (a > 0 || hasHigherGroup) {
            sb.append(DIGITS[a]).append(" trăm ");
        }

        // Đọc hàng chục
        if (b > 1) {
            sb.append(DIGITS[b]).append(" mươi ");
            if (c == 1) {
                sb.append("mốt ");
            } else if (c == 4) {
                sb.append("tư ");
            } else if (c == 5) {
                sb.append("lăm ");
            } else if (c > 0) {
                sb.append(DIGITS[c]).append(" ");
            }
        } else if (b == 1) {
            sb.append("mười ");
            if (c == 1) {
                sb.append("một ");
            } else if (c == 5) {
                sb.append("lăm ");
            } else if (c > 0) {
                sb.append(DIGITS[c]).append(" ");
            }
        } else { // b == 0 (Đã bỏ từ "lẻ" theo yêu cầu)
            if (c > 0) {
                sb.append(DIGITS[c]).append(" ");
            }
        }

        return sb.toString().trim();
    }
}
