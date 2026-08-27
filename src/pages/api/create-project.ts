import type { APIRoute } from "astro";
import { GetUserFromCookies } from "../../utils/auth";
import { db } from "../../db";
import { projects } from "../../db/schema";
import { CompressImage, UploadImageToCDN } from "../../utils/cdn";
import { GetHackatimeProjects } from "../../utils/hackatime";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const user = await GetUserFromCookies(cookies);
  if (!user) return redirect("/login");

  const formData = await request.formData();
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const githubUrl = formData.get("githubUrl") as string;
  const hackatimeProjects = formData.get("hackatimeProjects") as string;
  const playableUrl = (formData.get("playableUrl") ??
    formData.get("liveUrl") ??
    "") as string;

  // check that hackatime projects are legit
  var hackatimeProjectNames = JSON.parse(hackatimeProjects) as string[];
  if (!Array.isArray(hackatimeProjectNames)) {
    return redirect("/station/projects/create");
  }

  var hackatimeData = await GetHackatimeProjects(user.slackId);
  if (!hackatimeData.ok || !hackatimeData.projects) {
    return redirect("/station/projects/create");
  }

  for (const projectName of hackatimeProjectNames) {
    // check if project name is in hackatimeData.projects
    if (!hackatimeData.projects.some((p) => p.name === projectName)) {
      return redirect("/station/projects/create");
    }
  }

  const image = formData.get("image") as File | null;
  var imageUrl: string | null = null;

  if (image && image.size > 0) {
    try {
      const compressedBuffer = await CompressImage(image, 1920);
      imageUrl = await UploadImageToCDN(compressedBuffer, image.name);
    } catch (error) {
      console.error("Error uploading image:", error);
      return redirect(`/error?message=${error}`);
    }
  }

  if (!name || !description || !githubUrl || !hackatimeProjects) {
    return redirect("/station/projects/create");
  }

  await db.insert(projects).values({
    authorSlackId: user.slackId,

    projectName: name,
    projectDescription: description,
    projectCodeUrl: githubUrl,
    projectPlayableUrl: playableUrl || "",
    hackatimeProjects: hackatimeProjects,
    projectScreenshot:
      imageUrl ||
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Den_Haag_Hollands_Spoor.jpg/3840px-Den_Haag_Hollands_Spoor.jpg",
    overrideHoursSpent: 0,
    overrideHoursSpentReason: "",
  });

  return redirect("/station/home");
};
