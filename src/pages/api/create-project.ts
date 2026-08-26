import type { APIRoute } from "astro";
import { GetUserFromCookies } from "../../utils/auth";
import { db } from "../../db";
import { projects } from "../../db/schema";
import { CompressImage, UploadImageToCDN } from "../../utils/cdn";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const user = await GetUserFromCookies(cookies);
  if (!user) return redirect("/login");

  const formData = await request.formData();
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const githubUrl = formData.get("githubUrl") as string;
  const hackatimeProjects = formData.get("hackatimeProjects") as string;
  const image = formData.get("image") as File | null;
  var imageUrl: string | null = null;

  if (image && image.size > 0) {
    const compressedBuffer = await CompressImage(image, 128);
    imageUrl = await UploadImageToCDN(compressedBuffer, image.name);
  }

  if (!name || !description || !githubUrl || !hackatimeProjects) {
    return redirect("/station/projects/create");
  }

  if (!imageUrl) {
    db.insert(projects)
      .values({
        authorSlackId: user.slackId,
        name,
        description,
        githubUrl,
        hackatimeProjects,
      })
      .run();
  } else {
    db.insert(projects)
      .values({
        authorSlackId: user.slackId,
        name,
        description,
        githubUrl,
        hackatimeProjects,
        image: imageUrl,
      })
      .run();
  }

  return redirect("/station/home");
};
