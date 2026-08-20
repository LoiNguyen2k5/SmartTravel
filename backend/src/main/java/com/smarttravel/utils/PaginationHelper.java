package com.smarttravel.utils;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

public final class PaginationHelper {

    private PaginationHelper() {}

    public static Pageable buildPageable(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name())
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        return PageRequest.of(page, size, sort);
    }

    public static Pageable buildPageable(int page, int size) {
        return buildPageable(page, size, Constants.DEFAULT_SORT_BY, Constants.DEFAULT_SORT_DIR);
    }
}
