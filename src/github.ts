import * as core from '@actions/core';
import * as octokit from '@octokit/rest';
import { CreateIssueCommentParams } from './types';

export class GitHub {
	client: octokit.Octokit;

	constructor(token: string) {
		this.client = new octokit.Octokit({ auth: token });

		if (this.client === undefined || this.client === null) {
			throw new Error('Unable to create GitHub client');
		}
	}

	addComment = async (comment: CreateIssueCommentParams): Promise<void> => {
		try {
			const { owner, repo, issue: issue_number, body } = comment;
			await this.client.issues.createComment({
				owner,
				repo,
				issue_number,
				body,
			});
		} catch (error) {
			console.error(error);
			core.setFailed((error as Error)?.message ?? 'Failed to add comment');
		}
	};

	updateBody = async (comment: CreateIssueCommentParams): Promise<void> => {
		try {
			const { owner, repo, issue: issue_number, body } = comment;
			const issue = await this.client.issues.get({ owner, repo, issue_number });
			if (!issue.data.body) {
				await this.client.issues.update({ owner, repo, issue_number, body });
			} else if (!issue.data.body.includes(body)) {
				await this.client.issues.update({
					owner,
					repo,
					issue_number,
					body: `${body}\n\n${issue.data.body}`,
				});
			}
		} catch (error) {
			console.error(error);
			core.setFailed((error as Error)?.message ?? 'Failed to update title');
		}
	};
}
