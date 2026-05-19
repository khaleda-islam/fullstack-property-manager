import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useUser } from "../../context/UserContext";
import { getContractorRatings } from "../../services/api";

const DEFAULT_AVATAR = "https://placehold.co/52x52/cccccc/ffffff?text=?";

function StarDisplay({ rating }) {
  return (
    <div className="d-flex align-items-center gap-1 flex-wrap">
      {Array.from({ length: 10 }, (_, i) => (
        <i
          key={i}
          className={`bi ${i < rating ? "bi-star-fill text-warning" : "bi-star text-muted"}`}
          style={{ fontSize: 12 }}
        />
      ))}
      <span className="fw-bold ms-1 small">{rating}/10</span>
    </div>
  );
}

function RatingBadge({ rating }) {
  const color = rating >= 8 ? "success" : rating >= 5 ? "warning" : "danger";
  return (
    <span className={`badge bg-${color} fs-6 px-3 py-2`}>{rating}/10</span>
  );
}

function AverageCircle({ avg }) {
  const color = avg >= 8 ? "success" : avg >= 5 ? "warning" : "danger";
  return (
    <div
      className={`rounded-circle bg-${color} d-flex align-items-center justify-content-center flex-shrink-0`}
      style={{ width: 80, height: 80 }}
    >
      <span className="text-white fw-bold fs-4">{avg}</span>
    </div>
  );
}

export default function Ratings() {
  const { getAccessTokenSilently } = useAuth0();
  const { dbUser } = useUser();

  const [ratings,  setRatings]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const token = await getAccessTokenSilently();
        const data  = await getContractorRatings(token, dbUser.auth0Id);
        setRatings(data);
      } catch {
        // silent fail
      } finally {
        setLoading(false);
      }
    };
    if (dbUser?.auth0Id) load();
  }, [dbUser]);

  const average = ratings.length
    ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
    : "0.0";

  return (
    <div className="p-4">

      {/* Header */}
      <div className="mb-4">
        <h4 className="fw-bold mb-1">My Ratings</h4>
        <p className="text-muted small mb-0">Feedback received from landlords</p>
      </div>

      {/* Average rating card */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4 d-flex align-items-center gap-4 flex-wrap">
          <AverageCircle avg={average} />
          <div>
            <div className="fw-bold fs-5 mb-1">Average Rating</div>
            <StarDisplay rating={Math.round(parseFloat(average))} />
            <div className="text-muted small mt-1">
              Based on {ratings.length} review{ratings.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" />
        </div>
      ) : ratings.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-star fs-1 d-block mb-2 opacity-50" />
          <p className="fw-semibold">No ratings yet</p>
          <small>Ratings will appear here once landlords review your completed jobs</small>
        </div>
      ) : (
        <div className="row g-3">
          {ratings.map((r) => (
            <div key={r._id} className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="d-flex align-items-start gap-3 flex-wrap">

                    {/* Landlord photo */}
                    <img
                      src={r.landlord?.photo || DEFAULT_AVATAR}
                      alt={r.landlord?.name}
                      className="rounded-circle border flex-shrink-0"
                      width={52} height={52}
                      style={{ objectFit: "cover" }}
                    />

                    <div className="flex-grow-1">
                      {/* Landlord info + rating badge */}
                      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
                        <div>
                          <div className="fw-bold">{r.landlord?.name || "—"}</div>
                          <div className="text-muted small">
                            <i className="bi bi-envelope me-1" />{r.landlord?.email || "—"}
                          </div>
                        </div>
                        <RatingBadge rating={r.rating} />
                      </div>

                      {/* Stars */}
                      <div className="mb-2">
                        <StarDisplay rating={r.rating} />
                      </div>

                      {/* Comment */}
                      {r.comment ? (
                        <div
                          className="bg-light rounded-3 p-3 text-muted mb-2"
                          style={{ lineHeight: 1.7, fontSize: 14 }}
                        >
                          <i className="bi bi-chat-quote me-1 text-secondary" />
                          {r.comment}
                        </div>
                      ) : (
                        <div className="text-muted fst-italic small mb-2">No comment left</div>
                      )}

                      {/* Date */}
                      <div className="text-muted small">
                        <i className="bi bi-calendar me-1" />
                        {new Date(r.createdAt).toLocaleDateString([], {
                          year: "numeric", month: "long", day: "numeric",
                        })}
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
