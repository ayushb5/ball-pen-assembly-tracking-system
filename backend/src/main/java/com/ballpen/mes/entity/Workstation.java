package com.ballpen.mes.entity;

import com.ballpen.mes.enums.WorkstationStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "workstations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Workstation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String stationCode;

    @Column(nullable = false, length = 100)
    private String stationName;

    @Column(nullable = false, length = 50)
    private String stationType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_employee_id")
    private Employee assignedEmployee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "current_order_id")
    private ProductionOrder currentOrder;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private WorkstationStatus status = WorkstationStatus.IDLE;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
