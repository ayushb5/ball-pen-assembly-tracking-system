package com.ballpen.mes.repository;

import com.ballpen.mes.entity.Employee;
import com.ballpen.mes.enums.RoleType;
import com.ballpen.mes.enums.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    Optional<Employee> findByEmployeeCode(String employeeCode);

    boolean existsByEmployeeCode(String employeeCode);

    List<Employee> findByDepartment(String department);

    List<Employee> findByRole(RoleType role);

    List<Employee> findByStatus(UserStatus status);

    long countByStatus(UserStatus status);
}
