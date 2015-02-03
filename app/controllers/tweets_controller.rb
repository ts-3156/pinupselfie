class TweetsController < ApplicationController
  include TweetsHelper

  before_action :set_tweet, only: [:show]

  def index
    @tweets = Tweet.all
  end

  def show
    @user = @tweet.user
    @photo =
      if params[:photo_id].present? && params[:photo_id].match(/\A\d+\z/) && @tweet.media?
        photo_id = params[:photo_id]
        photo = @tweet.media.find{|m| m.id == photo_id }
        @tweet.media.first if photo.nil?
      else
        Hashie::Mash.new(Hash.new(''))
      end
  end

  private

  def client
    @client ||= ExTwitter.new(YAML.load_file(Rails.root.join('config/twitter.yml')))
  end

  def set_tweet
    if params[:status_id].present? && params[:status_id].match(/\A\d+\z/)
      @tweet = client.status(params[:status_id])
    end
  end
end
