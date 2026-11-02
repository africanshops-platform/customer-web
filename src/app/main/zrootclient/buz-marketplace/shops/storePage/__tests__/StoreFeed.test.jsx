import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PostCard from "../PostCard";
import StoreUpdatesPanel from "../StoreUpdatesPanel";
import { timeAgo } from "../feedTime";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

let mockUser;
jest.mock("app/store/hooks", () => ({ useAppSelector: () => mockUser }));
jest.mock("src/app/auth/user/store/userSlice", () => ({ selectUser: () => null }));

let mockFeed;
jest.mock("src/app/aaqueryhooks/feedQueries", () => ({ useStoreFeed: () => mockFeed }));
jest.mock("src/app/aaqueryhooks/legalDocumentQueries", () => ({
  useLegalDocument: () => ({ data: undefined }),
}));
jest.mock("src/app/shared-components/SimpleMarkdown", () => ({
  __esModule: true,
  default: () => null,
}));

const mockGuidelinesStatus = jest.fn();
const mockAccept = jest.fn();
const mockReport = jest.fn();
jest.mock("app/configs/data/client/RepositoryAuthClient", () => ({
  getFeedGuidelinesStatusApi: (...a) => mockGuidelinesStatus(...a),
  acceptFeedGuidelinesApi: (...a) => mockAccept(...a),
  reportFeedPostApi: (...a) => mockReport(...a),
}));
jest.mock("react-toastify", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const photo = (n) => ({
  kind: "IMAGE",
  url: `https://res.cloudinary.com/x/${n}.jpg`,
  publicId: `feed/s1/${n}`,
});
const post = (over = {}) => ({
  id: "p1",
  shopId: "s1",
  shopName: "Ogbete Main Market Traders",
  category: "BUSINESS_TIP",
  text: "Count your stock every Friday.",
  media: [],
  createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  ...over,
});
const feed = (posts, over = {}) => ({
  data: { pages: [{ data: { posts, pagination: { hasMore: false } } }] },
  isLoading: false,
  isError: false,
  refetch: jest.fn(),
  fetchNextPage: jest.fn(),
  hasNextPage: false,
  isFetchingNextPage: false,
  ...over,
});
const panel = () =>
  render(
    <MemoryRouter>
      <StoreUpdatesPanel shopId="s1" />
    </MemoryRouter>,
  );

beforeEach(() => {
  jest.clearAllMocks();
  mockUser = { email: "a@b.com" };
  mockFeed = feed([]);
});

describe("timeAgo", () => {
  const now = Date.parse("2026-11-02T12:00:00Z");
  it("reads naturally", () => {
    expect(timeAgo("2026-11-02T11:59:40Z", now)).toBe("just now");
    expect(timeAgo("2026-11-02T11:55:00Z", now)).toBe("5 minutes ago");
    expect(timeAgo("2026-11-02T10:00:00Z", now)).toBe("2 hours ago");
    expect(timeAgo("2026-11-01T10:00:00Z", now)).toBe("Yesterday");
    expect(timeAgo("2026-10-30T10:00:00Z", now)).toBe("3 days ago");
    expect(timeAgo("not a date", now)).toBe("");
  });
});

describe("PostCard", () => {
  it("shows the shop, how long ago, the category and the text", () => {
    render(<PostCard post={post()} onReport={jest.fn()} onShare={jest.fn()} />);
    expect(screen.getByText("Ogbete Main Market Traders")).toBeTruthy();
    expect(screen.getByText("2 hours ago")).toBeTruthy();
    expect(screen.getByText("Business tip")).toBeTruthy();
    expect(screen.getByText("Count your stock every Friday.")).toBeTruthy();
  });

  it("steps through up to five photos with a 1/N counter, and shows no controls for a single photo", () => {
    const { rerender, container } = render(
      <PostCard post={post({ media: [photo(1)] })} onReport={jest.fn()} onShare={jest.fn()} />,
    );
    expect(screen.getByTestId("post-media-count").textContent).toBe("1/1");
    expect(container.querySelector(".sp-nav")).toBeNull();
    rerender(
      <PostCard
        post={post({ media: [photo(1), photo(2), photo(3)] })}
        onReport={jest.fn()}
        onShare={jest.fn()}
      />,
    );
    expect(screen.getByTestId("post-media-count").textContent).toBe("1/3");
    fireEvent.click(screen.getByLabelText("Next photo"));
    expect(screen.getByTestId("post-media-count").textContent).toBe("2/3");
    fireEvent.click(screen.getByLabelText("Previous photo"));
    fireEvent.click(screen.getByLabelText("Previous photo"));
    expect(screen.getByTestId("post-media-count").textContent).toBe("3/3");
  });

  it("shows an event card with the date and place", () => {
    render(
      <PostCard
        post={post({
          category: "EVENT",
          event: { startsAt: "2026-11-14T09:00:00Z", place: "Ogbete Main Market, 9am to 5pm" },
        })}
        onReport={jest.fn()}
        onShare={jest.fn()}
      />,
    );
    expect(screen.getByTestId("post-event").textContent).toContain(
      "Ogbete Main Market, 9am to 5pm",
    );
    expect(screen.getByTestId("post-event").textContent).toContain("14");
  });

  it("opens the menu and reports this post", () => {
    const onReport = jest.fn();
    const p = post();
    render(<PostCard post={p} onReport={onReport} onShare={jest.fn()} />);
    fireEvent.click(screen.getByLabelText("More options"));
    fireEvent.click(screen.getByText("Report post"));
    expect(onReport).toHaveBeenCalledWith(p);
  });

  it("offers Share only: no likes or comments are invented before they exist", () => {
    const { container } = render(
      <PostCard post={post()} onReport={jest.fn()} onShare={jest.fn()} />,
    );
    expect(container.textContent).toContain("Share");
    expect(container.textContent).not.toMatch(/Like|Comment|\d+ likes/);
  });
});

describe("StoreUpdatesPanel", () => {
  it("shows skeletons while the posts load", () => {
    mockFeed = feed([], { isLoading: true });
    panel();
    expect(screen.getByTestId("store-feed-loading")).toBeTruthy();
  });

  it("shows an illustrated empty state when the shop has no posts", () => {
    panel();
    expect(screen.getByTestId("store-feed-empty")).toBeTruthy();
    expect(screen.getByText("No posts yet")).toBeTruthy();
  });

  it("shows a retry state when the posts fail to load", () => {
    mockFeed = feed([], { isError: true });
    panel();
    fireEvent.click(screen.getByText("Try again"));
    expect(mockFeed.refetch).toHaveBeenCalled();
  });

  it("lists the shop's real posts and a Show more button when there are more", () => {
    mockFeed = feed(
      [post({ id: "a", text: "First post" }), post({ id: "b", text: "Second post" })],
      { hasNextPage: true },
    );
    panel();
    expect(screen.getAllByTestId("store-post")).toHaveLength(2);
    fireEvent.click(screen.getByText("Show more posts"));
    expect(mockFeed.fetchNextPage).toHaveBeenCalled();
  });

  it("sends a guest who wants to report to sign in", async () => {
    mockUser = null;
    mockFeed = feed([post()]);
    panel();
    fireEvent.click(screen.getByLabelText("More options"));
    fireEvent.click(screen.getByText("Report post"));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/sign-in"));
    expect(mockGuidelinesStatus).not.toHaveBeenCalled();
  });

  it("asks for the community guidelines first, then the reason, then sends the report", async () => {
    mockFeed = feed([post()]);
    mockGuidelinesStatus.mockResolvedValue({ data: { accepted: false } });
    mockAccept.mockResolvedValue({ data: { accepted: true } });
    mockReport.mockResolvedValue({ data: { message: "Thanks. We will review this post." } });
    panel();
    fireEvent.click(screen.getByLabelText("More options"));
    fireEvent.click(screen.getByText("Report post"));
    expect(await screen.findByTestId("feed-guidelines")).toBeTruthy();
    fireEvent.click(screen.getByText("I agree and continue"));
    expect(await screen.findByTestId("feed-report")).toBeTruthy();
    fireEvent.click(screen.getByLabelText("Spam or an unwanted advert"));
    fireEvent.click(screen.getByText("Send report"));
    await waitFor(() =>
      expect(mockReport).toHaveBeenCalledWith({ postId: "p1", reason: "SPAM", note: undefined }),
    );
  });

  it("goes straight to the reason when the guidelines are already accepted", async () => {
    mockFeed = feed([post()]);
    mockGuidelinesStatus.mockResolvedValue({ data: { accepted: true } });
    panel();
    fireEvent.click(screen.getByLabelText("More options"));
    fireEvent.click(screen.getByText("Report post"));
    expect(await screen.findByTestId("feed-report")).toBeTruthy();
    expect(screen.queryByTestId("feed-guidelines")).toBeNull();
  });
});
