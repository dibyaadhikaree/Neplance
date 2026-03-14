"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useState } from "react";
import { updateJobAction } from "@/lib/actions/jobs";
import { Navbar } from "@/shared/components/Navbar";
import { Button, Input } from "@/shared/components/UI";
import {
  JOB_CATEGORIES,
  NEPAL_PROVINCES,
} from "@/shared/constants/jobCategories";

const createMilestoneId = () =>
  `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const buildInitialFormState = (job) => ({
  title: job.title || "",
  description: job.description || "",
  jobType: job.jobType || "digital",
  category: job.category || "",
  subcategory: job.subcategory || "",
  tags: (job.tags || []).join(", "),
  requiredSkills: (job.requiredSkills || []).join(", "),
  experienceLevel: job.experienceLevel || "",
  budgetType: job.budgetType || "fixed",
  budgetMin: job.budget?.min?.toString() || "",
  budgetMax: job.budget?.max?.toString() || "",
  deadline: job.deadline ? job.deadline.split("T")[0] : "",
  isUrgent: job.isUrgent || false,
  locationCity: job.location?.city || "",
  locationDistrict: job.location?.district || "",
  locationProvince: job.location?.province || "",
  milestones: (job.milestones || []).map((milestone) => ({
    id: createMilestoneId(),
    title: milestone.title || "",
    description: milestone.description || "",
    value: milestone.value?.toString() || "",
    dueDate: milestone.dueDate
      ? new Date(milestone.dueDate).toISOString().split("T")[0]
      : "",
  })),
});

const INITIAL_ACTION_STATE = {
  message: "",
  errors: [],
  milestoneErrors: {},
};

export function EditJobPageClient({ initialJob, initialUser }) {
  const router = useRouter();
  const user = initialUser;
  const [formState, setFormState] = useState(buildInitialFormState(initialJob));
  const [actionState, formAction, isPending] = useActionState(
    updateJobAction.bind(null, initialJob._id),
    INITIAL_ACTION_STATE,
  );

  const formErrors = actionState?.errors || [];
  const milestoneErrors = actionState?.milestoneErrors || {};

  const handleFormChange = (field, value) => {
    setFormState((previous) => ({ ...previous, [field]: value }));
  };

  const handleMilestoneChange = (index, field, value) => {
    setFormState((previous) => {
      const nextMilestones = [...previous.milestones];
      nextMilestones[index] = { ...nextMilestones[index], [field]: value };
      return { ...previous, milestones: nextMilestones };
    });
  };

  const addMilestone = () => {
    setFormState((previous) => ({
      ...previous,
      milestones: [
        ...previous.milestones,
        {
          id: createMilestoneId(),
          title: "",
          description: "",
          value: "",
          dueDate: "",
        },
      ],
    }));
  };

  const removeMilestone = (index) => {
    setFormState((previous) => ({
      ...previous,
      milestones: previous.milestones.filter(
        (_, milestoneIndex) => milestoneIndex !== index,
      ),
    }));
  };

  const serializedPayload = JSON.stringify(formState);

  return (
    <>
      <Navbar user={user} />

      <div className="dashboard">
        <div className="dashboard-content">
          <div style={{ marginBottom: "var(--space-6)" }}>
            <Link href="/dashboard" className="btn btn-ghost">
              Back to Dashboard
            </Link>
          </div>

          <h1 style={{ marginBottom: "var(--space-6)" }}>Edit Job</h1>

          <form className="card" action={formAction}>
            <input type="hidden" name="payload" value={serializedPayload} />

            {actionState?.message && (
              <div
                className="card-error"
                style={{ marginBottom: "var(--space-4)" }}
              >
                <p style={{ margin: 0 }}>{actionState.message}</p>
              </div>
            )}

            {formErrors.length > 0 && (
              <div
                className="card-error"
                style={{ marginBottom: "var(--space-4)" }}
              >
                {formErrors.map((error) => (
                  <p key={error} style={{ margin: 0 }}>
                    {error}
                  </p>
                ))}
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: "var(--space-4)",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: "1", minWidth: "200px" }}>
                <Input
                  label="Job Title"
                  value={formState.title}
                  onChange={(event) =>
                    handleFormChange("title", event.target.value)
                  }
                  placeholder="e.g. Landing page redesign"
                  required
                  disabled={isPending}
                />
              </div>
            </div>

            <Input
              label="Description"
              value={formState.description}
              onChange={(event) =>
                handleFormChange("description", event.target.value)
              }
              placeholder="Describe the work scope"
              disabled={isPending}
            />

            <div
              style={{
                display: "flex",
                gap: "var(--space-4)",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: "1", minWidth: "150px" }}>
                <label
                  htmlFor="jobType"
                  style={{
                    display: "block",
                    marginBottom: "var(--space-1)",
                    fontWeight: "var(--font-weight-medium)",
                  }}
                >
                  Job Type
                </label>
                <select
                  id="jobType"
                  value={formState.jobType}
                  onChange={(event) =>
                    handleFormChange("jobType", event.target.value)
                  }
                  disabled={isPending}
                  style={{
                    width: "100%",
                    padding: "var(--space-2)",
                    borderRadius: "var(--radius)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <option value="digital">Digital</option>
                  <option value="physical">Physical</option>
                </select>
              </div>
              <div style={{ flex: "2", minWidth: "200px" }}>
                <label
                  htmlFor="category"
                  style={{
                    display: "block",
                    marginBottom: "var(--space-1)",
                    fontWeight: "var(--font-weight-medium)",
                  }}
                >
                  Category{" "}
                  <span style={{ color: "var(--color-error)" }}>*</span>
                </label>
                <select
                  id="category"
                  value={formState.category}
                  onChange={(event) =>
                    handleFormChange("category", event.target.value)
                  }
                  disabled={isPending}
                  required
                  style={{
                    width: "100%",
                    padding: "var(--space-2)",
                    borderRadius: "var(--radius)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <option value="">Select Category</option>
                  {JOB_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ flex: "1", minWidth: "150px" }}>
                <Input
                  label="Subcategory"
                  value={formState.subcategory}
                  onChange={(event) =>
                    handleFormChange("subcategory", event.target.value)
                  }
                  placeholder="e.g. Frontend"
                  disabled={isPending}
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "var(--space-4)",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: "1", minWidth: "200px" }}>
                <Input
                  label="Tags (comma separated)"
                  value={formState.tags}
                  onChange={(event) =>
                    handleFormChange("tags", event.target.value)
                  }
                  placeholder="e.g. React, Node.js, MongoDB"
                  disabled={isPending}
                />
              </div>
              <div style={{ flex: "1", minWidth: "200px" }}>
                <Input
                  label="Required Skills (comma separated)"
                  value={formState.requiredSkills}
                  onChange={(event) =>
                    handleFormChange("requiredSkills", event.target.value)
                  }
                  placeholder="e.g. JavaScript, CSS"
                  disabled={isPending}
                />
              </div>
              <div style={{ flex: "1", minWidth: "150px" }}>
                <label
                  htmlFor="experienceLevel"
                  style={{
                    display: "block",
                    marginBottom: "var(--space-1)",
                    fontWeight: "var(--font-weight-medium)",
                  }}
                >
                  Experience Level
                </label>
                <select
                  id="experienceLevel"
                  value={formState.experienceLevel}
                  onChange={(event) =>
                    handleFormChange("experienceLevel", event.target.value)
                  }
                  disabled={isPending}
                  style={{
                    width: "100%",
                    padding: "var(--space-2)",
                    borderRadius: "var(--radius)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <option value="">Any</option>
                  <option value="entry">Entry Level</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "var(--space-4)",
                flexWrap: "wrap",
                alignItems: "flex-end",
              }}
            >
              <div style={{ flex: "1", minWidth: "120px" }}>
                <label
                  htmlFor="budgetType"
                  style={{
                    display: "block",
                    marginBottom: "var(--space-1)",
                    fontWeight: "var(--font-weight-medium)",
                  }}
                >
                  Budget Type
                </label>
                <select
                  id="budgetType"
                  value={formState.budgetType}
                  onChange={(event) =>
                    handleFormChange("budgetType", event.target.value)
                  }
                  disabled={isPending}
                  style={{
                    width: "100%",
                    padding: "var(--space-2)",
                    borderRadius: "var(--radius)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <option value="fixed">Fixed</option>
                  <option value="hourly">Hourly</option>
                </select>
              </div>
              <div style={{ flex: "1", minWidth: "150px" }}>
                <Input
                  label="Budget Min (NPR)"
                  type="number"
                  value={formState.budgetMin}
                  onChange={(event) =>
                    handleFormChange("budgetMin", event.target.value)
                  }
                  placeholder="5000"
                  required
                  disabled={isPending}
                />
              </div>
              <div style={{ flex: "1", minWidth: "150px" }}>
                <Input
                  label="Budget Max (NPR)"
                  type="number"
                  value={formState.budgetMax}
                  onChange={(event) =>
                    handleFormChange("budgetMax", event.target.value)
                  }
                  placeholder="10000"
                  disabled={isPending}
                />
              </div>
              <div style={{ flex: "1", minWidth: "150px" }}>
                <Input
                  label="Deadline"
                  type="date"
                  value={formState.deadline}
                  onChange={(event) =>
                    handleFormChange("deadline", event.target.value)
                  }
                  disabled={isPending}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                  marginBottom: "var(--space-1)",
                }}
              >
                <input
                  type="checkbox"
                  id="isUrgent"
                  checked={formState.isUrgent}
                  onChange={(event) =>
                    handleFormChange("isUrgent", event.target.checked)
                  }
                  disabled={isPending}
                />
                <label htmlFor="isUrgent" style={{ cursor: "pointer" }}>
                  Urgent
                </label>
              </div>
            </div>

            {formState.jobType === "physical" && (
              <div
                style={{
                  display: "flex",
                  gap: "var(--space-4)",
                  flexWrap: "wrap",
                  padding: "var(--space-3)",
                  background: "var(--color-bg-secondary)",
                  borderRadius: "var(--radius)",
                }}
              >
                <div style={{ flex: "1", minWidth: "150px" }}>
                  <Input
                    label="City"
                    value={formState.locationCity}
                    onChange={(event) =>
                      handleFormChange("locationCity", event.target.value)
                    }
                    placeholder="Kathmandu"
                    disabled={isPending}
                  />
                </div>
                <div style={{ flex: "1", minWidth: "150px" }}>
                  <Input
                    label="District"
                    value={formState.locationDistrict}
                    onChange={(event) =>
                      handleFormChange("locationDistrict", event.target.value)
                    }
                    placeholder="Kathmandu"
                    disabled={isPending}
                  />
                </div>
                <div style={{ flex: "1", minWidth: "150px" }}>
                  <label
                    htmlFor="locationProvince"
                    style={{
                      display: "block",
                      marginBottom: "var(--space-1)",
                      fontWeight: "var(--font-weight-medium)",
                    }}
                  >
                    Province
                  </label>
                  <select
                    id="locationProvince"
                    value={formState.locationProvince}
                    onChange={(event) =>
                      handleFormChange("locationProvince", event.target.value)
                    }
                    disabled={isPending}
                    style={{
                      width: "100%",
                      padding: "var(--space-2)",
                      borderRadius: "var(--radius)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <option value="">Select Province</option>
                    {NEPAL_PROVINCES.map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div style={{ marginTop: "var(--space-4)" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "var(--space-3)",
                }}
              >
                <strong>Milestones</strong>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={addMilestone}
                >
                  + Add milestone
                </button>
              </div>

              {formState.milestones.map((milestone, index) => (
                <div key={milestone.id} className="card-sm">
                  {milestoneErrors[index] && (
                    <div
                      className="card-error"
                      style={{ marginBottom: "var(--space-3)" }}
                    >
                      {milestoneErrors[index].map((error) => (
                        <p key={error} style={{ margin: 0 }}>
                          {error}
                        </p>
                      ))}
                    </div>
                  )}
                  <Input
                    label="Title"
                    value={milestone.title}
                    onChange={(event) =>
                      handleMilestoneChange(index, "title", event.target.value)
                    }
                    disabled={isPending}
                  />
                  <Input
                    label="Description"
                    value={milestone.description}
                    onChange={(event) =>
                      handleMilestoneChange(
                        index,
                        "description",
                        event.target.value,
                      )
                    }
                    disabled={isPending}
                  />
                  <div style={{ display: "flex", gap: "var(--space-4)" }}>
                    <Input
                      label="Value (NPR)"
                      type="number"
                      value={milestone.value}
                      onChange={(event) =>
                        handleMilestoneChange(
                          index,
                          "value",
                          event.target.value,
                        )
                      }
                      disabled={isPending}
                    />
                    <Input
                      label="Due Date"
                      type="date"
                      value={milestone.dueDate}
                      onChange={(event) =>
                        handleMilestoneChange(
                          index,
                          "dueDate",
                          event.target.value,
                        )
                      }
                      disabled={isPending}
                    />
                  </div>
                  {formState.milestones.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => removeMilestone(index)}
                      style={{ marginTop: "var(--space-2)" }}
                    >
                      Remove milestone
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: "var(--space-4)",
                display: "flex",
                gap: "var(--space-3)",
                flexWrap: "wrap",
              }}
            >
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isPending}
              >
                {isPending ? "Saving..." : "Save Changes"}
              </button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push("/dashboard")}
                disabled={isPending}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
