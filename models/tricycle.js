function main () {
    return difference(
        union(
            difference(
                cylinder({ h: 10 + 3, d: 56, fn: 120 }),
                translate([0, 0, 3], cylinder({ h: 10, d: 46 + 2 * 2.4, fn: 120 }))
            ),
            cylinder({ h: 20 + 3, d: 46, fn: 120 })
        ),
        cylinder({ h: 20 + 3, d: 20, fn: 120 })
    );
}
