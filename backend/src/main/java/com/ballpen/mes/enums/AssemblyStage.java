package com.ballpen.mes.enums;

/**
 * The 8 sequential production workflow stages in ball pen manufacturing.
 */
public enum AssemblyStage {
    MATERIAL_COLLECTION("Material Collection"),
    REFILL_PREPARATION("Refill Preparation"),
    BARREL_ASSEMBLY("Barrel Assembly"),
    TIP_INSTALLATION("Tip Installation"),
    CAP_ASSEMBLY("Cap Assembly"),
    QUALITY_CHECK("Quality Check"),
    PACKAGING("Packaging"),
    FINISHED_GOODS("Finished Goods");

    private final String displayName;

    AssemblyStage(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
