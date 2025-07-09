import {
  collection,
  getDoc,
  doc,
  updateDoc,
  getDocs,
  query,
  where,
  increment,
  setDoc,
  writeBatch,
  arrayRemove,
  arrayUnion,
  documentId,
} from 'firebase/firestore';
import { db } from '../firebase.service';
import { USER_COLLECTION } from './user.service';

export type Project = {
  name: string;
  createdAt: number;
  createdUserId: string;
  domain: string;
  createdEmail?: string;
};

export type ProjectDoc = Project & {
  id: string;
};

export type ProjectMember = {
  email: string;
  role: 'creator' | 'admin' | 'viewer';
  isPending: boolean;
  isAccepted: boolean;
  createdAt: number;
  updatedAt: number;
  userId: string | null;
};

const COLLECTION_NAME = 'projects';
const MEMBERS_COLLECTION_NAME = 'members';

export const projectsColRef = collection(db, COLLECTION_NAME);

export const createProject = async (
  project: Project,
  member: ProjectMember,
  userId: string
) => {
  const projectRef = doc(projectsColRef);
  const batch = writeBatch(db);
  batch.set(projectRef, project);
  batch.set(doc(projectRef, MEMBERS_COLLECTION_NAME, member.email), {
    ...member,
    createdAt: Date.now(),
  });
  batch.update(doc(db, USER_COLLECTION, userId), {
    projectIds: arrayUnion(projectRef.id),
    defaultProjectId: projectRef.id,
  });
  await batch.commit();
  // await setDoc(projectRef, project);
  // for (const member of members) {
  //   const memberRef = doc(
  //     db,
  //     COLLECTION_NAME,
  //     projectRef.id,
  //     MEMBERS_COLLECTION_NAME,
  //     member.email
  //   );
  //   await setDoc(memberRef, { ...member, createdAt: Date.now() });
  // }
  return projectRef.id;
};

export const getProjectsByIds = async (
  projectIds: string[]
): Promise<ProjectDoc[]> => {
  const projects = await getDocs(
    query(
      collection(db, COLLECTION_NAME),
      where(documentId(), 'in', projectIds)
    )
  );
  return projects.docs.map((doc) => ({
    ...(doc.data() as Project),
    id: doc.id,
  }));
};

export const getProjectById = async (
  projectId: string
): Promise<ProjectDoc | null> => {
  const project = await getDoc(doc(db, COLLECTION_NAME, projectId));
  if (!project.exists()) {
    return null;
  }
  return { ...(project.data() as Project), id: project.id };
};

export const updateProject = async (id: string, project: Partial<Project>) => {
  const projectRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(projectRef, project);
};

export const addMemberToProject = async (
  projectId: string,
  member: ProjectMember
) => {
  const memberRef = doc(
    db,
    COLLECTION_NAME,
    projectId,
    MEMBERS_COLLECTION_NAME,
    member.email
  );
  await setDoc(memberRef, { ...member });
};

export const getProjectMembers = async (projectId: string) => {
  const members = await getDocs(
    query(collection(db, COLLECTION_NAME, projectId, MEMBERS_COLLECTION_NAME))
  );
  return members.docs.map((doc) => doc.data() as ProjectMember);
};

export const removeUserFromMembers = async (
  email: string,
  projectId: string,
  userId: string | null
) => {
  const batch = writeBatch(db);
  const memberRef = doc(
    db,
    COLLECTION_NAME,
    projectId,
    MEMBERS_COLLECTION_NAME,
    email
  );
  batch.delete(memberRef);
  // Update the user
  if (userId) {
    const userRef = doc(db, 'users', userId);
    batch.update(userRef, {
      projectIds: arrayRemove(projectId),
      updatedAt: Date.now(),
    });
  }

  await batch.commit();
};

export const getProjectsByDomain = async (domain: string) => {
  const projects = await getDocs(
    query(collection(db, COLLECTION_NAME), where('domain', '==', domain))
  );
  return projects.docs.map((doc) => doc.data() as Project);
};
